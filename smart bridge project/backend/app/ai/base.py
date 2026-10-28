from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pathlib import Path


class BaseVisionProvider(ABC):
    @abstractmethod
    async def analyze_food(self, image_path: Path) -> Dict[str, Any]:
        """Recognize food items and estimate portion size."""
        pass

    @abstractmethod
    async def analyze_freshness(self, image_path: Path, food_hint: Optional[str] = None) -> Dict[str, Any]:
        """Analyze visual freshness indicators and surface defects."""
        pass

    @abstractmethod
    async def analyze_hygiene(self, image_path: Path) -> Dict[str, Any]:
        """Analyze kitchen/surface hygiene and visible clutter/cleanliness."""
        pass

