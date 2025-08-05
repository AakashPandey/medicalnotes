# 1. Create a new virtual environment
python3 -m venv ocr-env

# 2. Activate it
source ocr-env/bin/activate

# 3. Upgrade pip (important)
pip install --upgrade pip

# 4. Install dependencies
pip install flask paddleocr python-multipart

# 5. Run the commands to start an instance of easyocr

docker build -t easyocr-flask . 
docker run -p 5009:5009 easyocr-flask 