import torch
from PIL import Image
from transformers import AutoProcessor, AutoModel


class VisualEmbedding:

    def __init__(self):

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self.model_name = "google/siglip-base-patch16-224"

        self.processor = AutoProcessor.from_pretrained(
            self.model_name
        )

        self.model = AutoModel.from_pretrained(
            self.model_name
        ).to(self.device)

        self.model.eval()

    def encode_image(self, image_path):

        image = Image.open(image_path).convert("RGB")

        inputs = self.processor(
            images=image,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():

            image_features = self.model.get_image_features(
                **inputs
            )

        image_features = image_features / image_features.norm(
            dim=-1,
            keepdim=True
        )

        return image_features[0].cpu().numpy().tolist()