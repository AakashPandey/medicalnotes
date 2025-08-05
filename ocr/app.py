from flask import Flask, request, jsonify
import easyocr
import os
import requests
from urllib.parse import urlparse
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['DOWNLOAD_FOLDER'] = 'downloads'
os.makedirs(app.config['DOWNLOAD_FOLDER'], exist_ok=True)

reader = easyocr.Reader(['en'], gpu=False)

@app.route('/')
def index():
    return 'EasyOCR API is running'


@app.route('/ocr', methods=['POST'])
def ocr():
    data = request.get_json()
    if not data or 'image_url' not in data:
        return jsonify({'error': 'No image_url provided in JSON body'}), 400

    image_url = data['image_url'].strip()
    if not image_url:
        return jsonify({'error': 'Empty image_url provided'}), 400

    try:
        parsed_url = urlparse(image_url)
        ext = os.path.splitext(parsed_url.path)[1]
        if ext.lower() not in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp']:
            ext = '.jpg' 
        filename = secure_filename(f"downloaded_image{ext}")
        file_path = os.path.join(app.config['DOWNLOAD_FOLDER'], filename)

        response = requests.get(image_url, timeout=10, stream=True)
        if response.status_code != 200:
            return jsonify({'error': 'Failed to download image', 'status_code': response.status_code}), 400

        with open(file_path, 'wb') as f:
            for chunk in response.iter_content(1024):
                f.write(chunk)

        result = reader.readtext(file_path)
        lines = [
            {'text': line[1], 'confidence': float(line[2])}
            for line in result
        ]
        full_text = " ".join([line['text'] for line in lines])

        return jsonify({
            'full_text': full_text,
            'lines': lines
        })

    except requests.exceptions.Timeout:
        return jsonify({'error': 'Image download timed out'}), 408
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Error downloading image: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'OCR processing failed: {str(e)}'}), 500
    finally:
        try:
            if 'file_path' in locals() and os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass  


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5009)