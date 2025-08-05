from flask import Flask, request, jsonify
import easyocr
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Load model (English only)
reader = easyocr.Reader(['en'], gpu=False)

@app.route('/')
def index():
    return 'EasyOCR API is running'

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    image = request.files['image']
    filename = secure_filename(image.filename)
    path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image.save(path)

    try:
        result = reader.readtext(path)
        lines = [
            {'text': line[1], 'confidence': float(line[2])}
            for line in result
        ]

        return jsonify({
            'full_text': " ".join([l["text"] for l in lines]),
            'lines': lines
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5009)
