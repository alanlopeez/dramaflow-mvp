import os
import logging
from typing import Dict, Any, Tuple
from PIL import Image, ImageFilter, ImageOps

logger = logging.getLogger(__name__)

class BackgroundRemover:
    """
    Neural Background Removal and 2.5D Parallax Layer Generator powered by danielgatis/rembg.
    Extracts high-precision subject cutouts with alpha channels for layered video motion.
    """
    def __init__(self, model_name: str = "u2net"):
        self.model_name = model_name
        self.rembg_session = None
        try:
            from rembg import new_session
            self.rembg_session = new_session(model_name)
            logger.info(f"Rembg ({model_name}) neural session initialized.")
        except Exception as e:
            logger.warning(f"Rembg session initialization: {e}. Fallback cutout mode enabled.")

    def remove_background(
        self,
        input_image_path: str,
        output_image_path: str,
        alpha_matting: bool = True,
        post_process_mask: bool = True
    ) -> str:
        """
        Removes background from input image to produce transparent PNG.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_image_path)), exist_ok=True)
        
        if self.rembg_session and os.path.exists(input_image_path):
            try:
                from rembg import remove
                with open(input_image_path, "rb") as input_file:
                    input_data = input_file.read()
                    output_data = remove(
                        input_data,
                        session=self.rembg_session,
                        alpha_matting=alpha_matting,
                        alpha_matting_foreground_threshold=240,
                        alpha_matting_background_threshold=10,
                        alpha_matting_erode_size=10,
                        post_process_mask=post_process_mask
                    )
                    
                with open(output_image_path, "wb") as output_file:
                    output_file.write(output_data)
                    
                logger.info(f"Rembg: Background removed successfully -> {output_image_path}")
                return output_image_path
            except Exception as e:
                logger.error(f"Rembg processing failed: {e}. Fallback RGBA conversion used.")

        # Fallback: Convert to RGBA
        try:
            img = Image.open(input_image_path).convert("RGBA")
            img.save(output_image_path, "PNG")
        except Exception:
            img = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
            img.save(output_image_path, "PNG")
            
        return output_image_path

    def generate_parallax_layers(
        self,
        input_image_path: str,
        output_dir: str
    ) -> Dict[str, Any]:
        """
        Splits a single visual into two 2.5D Parallax layers:
        1. Foreground cutout (character subject with alpha transparency)
        2. Background plate (environment slightly enlarged & softly blurred for depth of field)
        """
        os.makedirs(output_dir, exist_ok=True)
        foreground_path = os.path.join(output_dir, "foreground_cutout.png")
        background_path = os.path.join(output_dir, "background_plate.png")
        
        # 1. Generate transparent foreground cutout
        self.remove_background(input_image_path, foreground_path)
        
        # 2. Generate blurred background plate
        try:
            if os.path.exists(input_image_path):
                with Image.open(input_image_path) as orig:
                    bg = orig.convert("RGB")
                    # Soft gaussian blur to simulate shallow depth-of-field lens
                    bg_blurred = bg.filter(ImageFilter.GaussianBlur(radius=8))
                    bg_blurred.save(background_path, "PNG", quality=95)
            else:
                bg = Image.new("RGB", (1080, 1920), color=(15, 17, 26))
                bg.save(background_path, "PNG")
        except Exception as e:
            logger.error(f"Failed generating background plate: {e}")
            background_path = input_image_path

        return {
            "foreground_cutout_path": foreground_path,
            "background_plate_path": background_path,
            "has_alpha_channel": True,
            "recommended_fg_motion": "zoom_in_fast",
            "recommended_bg_motion": "zoom_in_slow"
        }
