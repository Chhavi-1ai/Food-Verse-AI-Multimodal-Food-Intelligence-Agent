import cv2
import numpy as np
from pathlib import Path
from PIL import Image
from typing import Dict, Any, Tuple


class CVAnalyzer:
    """Real OpenCV and Pillow image feature extractor."""

    @staticmethod
    def validate_and_load_image(image_path: Path) -> Tuple[np.ndarray, Dict[str, Any]]:
        """Validates image file integrity, format, dimensions and loads RGB numpy array."""
        if not image_path.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")

        try:
            with Image.open(image_path) as pil_img:
                format_detected = pil_img.format
                width, height = pil_img.size
                pil_img.verify()
        except Exception as e:
            raise ValueError(f"Corrupted or invalid image format: {str(e)}")

        # Reopen and convert to RGB
        with Image.open(image_path) as pil_img:
            rgb_img = pil_img.convert("RGB")
            np_img = np.array(rgb_img)

        metadata = {
            "width": width,
            "height": height,
            "aspect_ratio": round(width / max(1, height), 2),
            "format": format_detected,
            "total_pixels": width * height,
        }
        return np_img, metadata

    @staticmethod
    def extract_visual_metrics(rgb_img: np.ndarray) -> Dict[str, Any]:
        """Extracts color space distributions, edge density, and surface spot metrics using OpenCV."""
        # Convert RGB to BGR for standard OpenCV functions
        bgr = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2BGR)
        hsv = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2HSV)
        gray = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)

        # 1. Brightness & Contrast
        mean_brightness = float(np.mean(gray))
        std_contrast = float(np.std(gray))

        # 2. HSV distributions
        mean_h = float(np.mean(hsv[:, :, 0]))  # Hue: 0-179
        mean_s = float(np.mean(hsv[:, :, 1]))  # Saturation: 0-255
        mean_v = float(np.mean(hsv[:, :, 2]))  # Value: 0-255

        # 3. Texture sharpness / variation (Laplacian variance)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # 4. Edge density (Canny edges)
        edges = cv2.Canny(gray, 100, 200)
        edge_density = float(np.count_nonzero(edges) / max(1, edges.size))

        # 5. Localized dark blemishes / discoloration detection
        # Spot detection: pixels significantly darker than neighborhood or low value & high saturation spots
        blurred = cv2.GaussianBlur(gray, (15, 15), 0)
        diff = cv2.absdiff(gray, blurred)
        _, thresh_spots = cv2.threshold(diff, 28, 255, cv2.THRESH_BINARY)
        spot_ratio = float(np.count_nonzero(thresh_spots) / max(1, thresh_spots.size))

        # 6. Color predominance
        # Classify dominant color tone based on HSV
        if mean_s < 35:
            color_tone = "neutral/pale/white"
        elif mean_h < 15 or mean_h > 165:
            color_tone = "red/crimson"
        elif 15 <= mean_h < 35:
            color_tone = "orange/warm brown"
        elif 35 <= mean_h < 85:
            color_tone = "green/yellow-green"
        elif 85 <= mean_h < 130:
            color_tone = "cyan/green-blue"
        else:
            color_tone = "blue/purple"

        return {
            "mean_brightness": round(mean_brightness, 2),
            "contrast": round(std_contrast, 2),
            "dominant_tone": color_tone,
            "mean_hue": round(mean_h, 2),
            "mean_saturation": round(mean_s, 2),
            "sharpness_laplacian": round(laplacian_var, 2),
            "edge_density": round(edge_density, 4),
            "surface_spot_ratio": round(spot_ratio, 4),
        }

