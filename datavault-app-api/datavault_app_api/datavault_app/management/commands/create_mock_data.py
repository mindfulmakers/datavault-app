from __future__ import annotations

from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from datavault_app_api.datavault_app.models import LocationPoint


class Command(BaseCommand):
    help = "Create mock location history for the demo map."

    def handle(self, *args, **options):
        now = timezone.now().replace(minute=0, second=0, microsecond=0)
        start = now - timedelta(days=6)
        route = [
            ("Brooklyn apartment", 40.6782, -73.9442),
            ("Morning coffee", 40.7219, -73.9575),
            ("Coworking desk", 40.7411, -73.9897),
            ("Lunch walk", 40.7308, -73.9973),
            ("Prospect Park loop", 40.6602, -73.9690),
            ("Museum stop", 40.7794, -73.9632),
            ("Dinner in Queens", 40.7282, -73.7949),
            ("Home again", 40.6782, -73.9442),
        ]

        LocationPoint.objects.all().delete()

        records = []
        for day_offset in range(7):
            for stop_index, (label, latitude, longitude) in enumerate(route):
                records.append(
                    LocationPoint(
                        label=label,
                        latitude=latitude + (day_offset * 0.004),
                        longitude=longitude + (day_offset * 0.003),
                        recorded_at=start
                        + timedelta(days=day_offset, hours=stop_index * 2),
                    )
                )

        LocationPoint.objects.bulk_create(records)
        self.stdout.write(
            self.style.SUCCESS(f"Created {len(records)} mock location points.")
        )
