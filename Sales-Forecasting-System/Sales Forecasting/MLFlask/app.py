import base64
import csv
from io import BytesIO
import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
from flask import Flask, make_response, request, jsonify, send_file
from flask_cors import CORS
from pymongo import MongoClient
import os
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, accuracy_score
from firebase_admin import auth


app = Flask(__name__)
CORS(app)

client = MongoClient('mongodb://localhost:27017/')
db = client['mydatabase']  # replace your_db_name with your database name
collection = db['mycollection'] # replace your_collection_name with your collection name

# prediction_collection = db['prediction_collection']
@app.route('/upload-csv', methods=['POST'])
def upload_csv():
    try:
      
        user_id = request.headers.get('Authorization')
        email = request.headers.get('X-User-Email', '')
        print(email)
        csv_file = request.files['csvFile']
        periodicity = request.form.get('periodicity')
        time_period = request.form.get('timePeriod')

        # Save the file to your project folder
        filename = csv_file.filename
        filepath = os.path.join(app.root_path, 'uploads', filename)
        csv_file.save(filepath)
      

        # Save the data to MongoDB
        csv_data = csv_file.read().decode('utf-8')
        data = {'email':email,'user_id': user_id,'periodicity': periodicity, 'time_period': time_period, 'csv_data': csv_data, 'filename': filename}
        result = collection.insert_one(data)
    

        # Read the data from MongoDB and preprocess it
        df = pd.read_csv(filepath)
        df.dropna(inplace=True)
        df.rename(columns={'date': 'ds', 'sales': 'y'}, inplace=True)
        df['ds'] = pd.to_datetime(df['ds'])
        df.sort_values(by='ds', ascending=True, inplace=True)
       


        # Set the periodicity and time period based on user input
        if periodicity == 'daily':
            time_freq = 'D'
        elif periodicity == 'weekly':
            time_freq = 'W'
        elif periodicity == 'monthly':
            time_freq = 'M'
        elif periodicity == 'yearly':
            time_freq = 'Y'
        else:
            raise ValueError('Invalid periodicity')

        # Filter the data to only include the time period of interest
        forecast_data = df.tail(int(time_period))

        # Train the Prophet model
        model = Prophet()
        model.fit(df.iloc[:-int(time_period)])

       

        try:
            # Predict the future sales using Prophet model
            future = model.make_future_dataframe(periods=int(time_period), freq=time_freq)
            forecast = model.predict(future)
            forecast = forecast.tail(int(time_period))
            forecast[['ds', 'yhat']].to_csv('predicted_sales.csv', index=False)

        except Exception as e:
            response = {'error': str(e)}
            return jsonify(response), 500


        # # Save the predicted data to a new CSV file
        # forecast.to_csv('predicted_sales.csv', index=False)
       

        # Filter the forecast to only include the time period of interest
        forecast = forecast.tail(int(time_period))

        #  # Save predicted data to a new collection
        # for i, row in forecast.iterrows():
        #     prediction = {'ds': row['ds'], 'yhat': row['yhat']}
        #     prediction_collection.insert_one(prediction)

        # Plot the forecast and actual sales
        fig, ax = plt.subplots()
        ax.plot(df['ds'], df['y'], label='Actual')
        ax.plot(forecast['ds'], forecast['yhat'], label='Forecast')
        ax.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'], alpha=0.3)
        ax.legend()

        # Save the plot to a file
        plot_filename = 'forecast_plot.png'
        plot_filepath = os.path.join(app.root_path, 'uploads', plot_filename)
        plt.savefig(plot_filepath)
        

        # Calculate the model validation metrics
        y_true = forecast_data['y'].values
        y_pred = forecast['yhat'].values
        mape = mean_absolute_percentage_error(y_true, y_pred)
        rmse = mean_squared_error(y_true, y_pred, squared=False)
        acc = accuracy_score(y_true, y_pred.round(), normalize=True)
        mae = mean_absolute_error(y_true, y_pred)
        # r2 = r2_score(y_true, y_pred)
        
         # Save the inserted data's _id to file_history_collection
        file_history = {'user_id': user_id, 'file_id': result.inserted_id}
        file_history_collection = db['file_history_collection']  # Replace with your collection name
        file_history_collection.insert_one(file_history)
        print("Accuracy:",acc)
        
       # Return the forecast plot, forecast data, and model validation metrics as JSON response
        response = {'forecast_data': forecast.to_dict(),'actual':df.to_dict(), 'forecast_plot': plot_filename,
            'mape': mape,'rmse':rmse,'acc':acc,'mae':mae,'predicted_data_csv': 'predicted_sales.csv'}

        return jsonify(response)


    except Exception as e:
        response = {'error': str(e)}
        return jsonify(response), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
