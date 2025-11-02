from flask import Flask, render_template, request, send_file, session
import pandas as pd
import os
import uuid

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size
# Set SECRET_KEY from environment variable for production; use a default for development
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key')

# Ensure upload and temp directories exist
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

TEMP_DUPLICATES_FOLDER = 'temp_duplicates'
if not os.path.exists(TEMP_DUPLICATES_FOLDER):
    os.makedirs(TEMP_DUPLICATES_FOLDER)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return "No file part", 400
    
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400
    
    if file:
        try:
            df = pd.read_csv(file)
            # Identify duplicates across all columns
            duplicates = df[df.duplicated(keep=False)]

            # Generate unique filename for storing duplicates
            if not duplicates.empty:
                unique_id = str(uuid.uuid4())
                duplicate_filename = f"{unique_id}_duplicates.csv"
                duplicate_path = os.path.join(TEMP_DUPLICATES_FOLDER, duplicate_filename)
                
                # Save duplicates to temporary file
                duplicates.to_csv(duplicate_path, index=False)
                
                # Store the filename in session for download retrieval
                session['duplicate_file'] = duplicate_filename
            else:
                # Clear any previous duplicate file from session
                session.pop('duplicate_file', None)

            return render_template('results.html',
                                   original_data=df.to_html(classes='table table-striped', index=False),
                                   duplicate_data=duplicates.to_html(classes='table table-striped', index=False) if not duplicates.empty else None,
                                   has_duplicates=not duplicates.empty)
        except Exception as e:
            return f"Error processing file: {e}", 500
    
    return "Something went wrong", 500


@app.route('/download_duplicates', methods=['GET'])
def download_duplicates():
    # Retrieve the duplicate filename from session
    duplicate_filename = session.get('duplicate_file')
    
    if not duplicate_filename:
        return "No duplicate file found. Please upload a CSV file first.", 404
    
    duplicate_path = os.path.join(TEMP_DUPLICATES_FOLDER, duplicate_filename)
    
    # Check if file exists
    if not os.path.exists(duplicate_path):
        return "Duplicate file not found. It may have expired.", 404
    
    try:
        # Read the CSV file and send it for download
        return send_file(
            duplicate_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='duplicates.csv'
        )
    except Exception as e:
        return f"Error downloading file: {e}", 500


if __name__ == '__main__':
    app.run(debug=True)






