from main import convert_to_local
from datetime import datetime

def test_convert_to_local(): 
    timezone_string = "Europe/London"
    datetime_input = datetime(2026, 7, 20, 23, 0)
    result = convert_to_local(datetime_input, timezone_string)
    
    assert result.hour == 00   # UTC + 1
    assert result.day == 21    # since local time is midnight
    assert result.tzinfo.key == "Europe/London"