import logging
import azure.functions as func

app = func.FunctionApp()

"""
the function app is trriggered every 5 minutes. 
"""
@app.timer_trigger(schedule="0 */5 * * * *", arg_name="myTimer", run_on_startup=False,
              use_monitor=False) 
def google_health_api(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logging.info('The timer is past due!')

    logging.info('Python timer trigger function executed.')