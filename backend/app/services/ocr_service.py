import easyocr

class OCRService:

    def __init__(self):

        self.reader = easyocr.Reader(
            ["en"],
            gpu=True
        )

    def extract_text(self, image_path):

        results = self.reader.readtext(
            image_path
        )

        texts = []

        for result in results:

            text = result[1]
            confidence = result[2]

            if confidence > 0.4:
                texts.append(text)

        return " ".join(texts)