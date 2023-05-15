import json,requests
from geolib import geohash
from flask_cors import CORS
from flask import Flask, request

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
   return app.send_static_file('events.html')

@app.route('/search', methods=['GET'])
def search():
    args = request.args
    keyword = args.get('keyword')
    segmentId = args.get('segmentId')
    radius = args.get('radius')
    unit = args.get('unit')
    latitude = args.get('latitude')
    longitude = args.get('longitude')
    geoPoint = geohash.encode(latitude, longitude, 7)

    url = "https://app.ticketmaster.com/discovery/v2/events.json?"
    key = "kAy1tmlKRL9aCMvPMnWLGLhGLGQG3vLN"

    parameters = {
        'keyword' : keyword,
        'segmentId' : segmentId,
        'radius' : radius,
        'unit' : unit,
        'geoPoint' : geoPoint,
        'apikey' : key
    }

    response = requests.get(url, params = parameters)
    
    content = response.content
    return content

@app.route('/event_details', methods=['GET'])
def event_details():
    args = request.args

    url = "https://app.ticketmaster.com/discovery/v2/events/" + args.get('id')+"?"
    key = "kAy1tmlKRL9aCMvPMnWLGLhGLGQG3vLN"

    parameters = {
        'apikey': key,
    }
    
    response = requests.get(url, params = parameters)

    content = response.content
    return content

@app.route('/venue_details', methods=['GET'])
def venue_details():
    args = request.args
    keyword = args.get('keyword')
    url = "https://app.ticketmaster.com/discovery/v2/venues?"
    key = "kAy1tmlKRL9aCMvPMnWLGLhGLGQG3vLN"

    parameters = {
        'apikey': key,
        'keyword': keyword
    }
    response = requests.get(url, params = parameters)
    content = response.content
    return content


if __name__ == '__main__':
    app.run(host='https://python-172999.wl.r.appspot.com/', port=8080, debug=True)
