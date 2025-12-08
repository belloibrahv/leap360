#!/bin/bash

python seed.py
if [ $? -ne 0 ]; then exit 1; fi

fastapi run app/main.py --host 0.0.0.0 --port ${PORT}
