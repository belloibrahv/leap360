from typing import Any, dataclass_transform
from dataclasses import field, Field, MISSING


@dataclass_transform(kw_only_default=True, field_specifiers=(field,))
class Record(dict[str, Any]):
    def __init__(self, **kwargs: dict[str, Any]) -> None:
        fields = list(self.__annotations__)
        missing_fields = fields - kwargs.keys()

        for missing_field in missing_fields:
            if not hasattr(self.__class__, missing_field):
                continue

            value = getattr(self.__class__, missing_field)

            if not isinstance(value, Field):
                kwargs[missing_field] = value
                continue

            if value.default != MISSING:
                kwargs[missing_field] = value.default

            elif value.default_factory != MISSING:
                kwargs[missing_field] = value.default_factory()

        kwargs = {key: kwargs[key] for key in fields}

        for key, value in kwargs.items():
            setattr(self, key, value)

        super().__init__(kwargs)
