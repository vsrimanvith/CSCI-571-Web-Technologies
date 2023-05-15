const express = require('express');
const cors = require('cors');
const axios = require('axios');
const geohash = require('ngeohash');
const app = express();

const ticketmasterkey = "kAy1tmlKRL9aCMvPMnWLGLhGLGQG3vLN";
const port = process.env.PORT || 8080;

app.use(cors());

app.use(express.static(process.cwd()));

app.get('/', (req,res) => {
    res.sendFile("index.html")
  });

app.get('/api/suggest', function(req,res){
    let suggest_keyword = req.query.input_text;
    let suggest_url = 'https://app.ticketmaster.com/discovery/v2/suggest?apikey='+ticketmasterkey+'&keyword=' + suggest_keyword; 
    
    axios(suggest_url).then(response => {
        res.json(response.data)
    }).catch(err => {
        res.send(err);
    });
})

app.get('/api/search', function(req,res){
    let keyword = req.query.keyword;
    let distance = req.query.distance;
    let category = req.query.category;
    let lat = req.query.latitude;
    let long = req.query.longitude;
    let segmentId='';
    if(category == "music") segmentId="KZFzniwnSyZfZ7v7nJ";
    if(category == "sports") segmentId="KZFzniwnSyZfZ7v7nE";
    if(category == "arts") segmentId="KZFzniwnSyZfZ7v7na";
    if(category == "film") segmentId="KZFzniwnSyZfZ7v7nn";
    if(category == "miscellaneous") segmentId="KZFzniwnSyZfZ7v7n1";
    if(category == "default") segmentId='';

    let geoPoint = geohash.encode(lat, long, 7);
    
    let ticketmaster_search_url = segmentId?'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ticketmasterkey+'&keyword='+keyword+'&segmentId='+segmentId+'&radius='+distance+'&unit=miles'+'&geoPoint='+geoPoint:'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ticketmasterkey+'&keyword='+keyword+'&radius='+distance+'&unit=miles'+'&geoPoint='+geoPoint; 
    
    axios(ticketmaster_search_url).then(response => {
        res.json(response.data)
    }).catch(err => {
        res.send(err);
    });
})

app.get('/api/details',function(req,res){
    let id = req.query.id;
    details_url = "https://app.ticketmaster.com/discovery/v2/events/"+id+"?apikey="+ticketmasterkey;

    axios(details_url).then(response => {
        res.json(response.data)
    }).catch(err => {
        res.send(err);
    }); 
})

app.get('/api/venue',function(req,res){
    let venue_name = req.query.venue_name;
    venue_url = "https://app.ticketmaster.com/discovery/v2/venues?apikey="+ticketmasterkey+"&keyword="+venue_name;

    axios(venue_url).then(response => {
        res.json(response.data)
    }).catch(err => {
        res.send(err);
    });
})


// SPOTIFY

var SpotifyWebApi = require('spotify-web-api-node');

var spotifyApi = new SpotifyWebApi({
    clientId: '650b0bcdc5d1409aba8cf75e6c251a90',
    clientSecret: '1eac3ec24ba744cb83f86618b7e4a755',
  });

function getNewToken() {
  return spotifyApi.clientCredentialsGrant().then(
    function(data) {
      spotifyApi.setAccessToken(data.body['access_token']);
      setTimeout(getNewToken, (data.body['expires_in'] - 60) * 1000); // refresh token 1 minute before it expires
    },
    function(err) {
      console.log('Something went wrong when retrieving an access token', err);
      setTimeout(getNewToken, 5000); // retry after 5 seconds if there's an error
    }
  );
}

getNewToken(); // get the initial access token

app.get('/api/spotify', function(req, res) {
  const artistsstring = decodeURIComponent(req.query.artists_list);
  const artists = artistsstring.split(',');
  const promises = [];

  artists.forEach((artist) => {
    promises.push(spotifyApi.searchArtists(artist));
  });

  Promise.all(promises)
    .then((data) => {
      const artistAlbumsPromises = [];
      const artists = [];
      data.forEach((result) => {

        const spotifyArtistID = result.body.artists.items[0].id;
        artistAlbumsPromises.push(spotifyApi.getArtistAlbums(spotifyArtistID, { limit: 3 }));
        artists.push(result.body.artists.items[0]);
      });
      Promise.all(artistAlbumsPromises)
        .then((albumsData) => {
          const albums = [];
          albumsData.forEach((result, index) => {
            if (result.body && result.body.items) {
              const artistAlbums = result.body.items.map((album) => {
                return {
                  name: album.name,
                  release_date: album.release_date,
                  image: album.images[0].url,
                  spotify_url: album.external_urls.spotify,
                };
              });
              albums.push({
                artist: artists[index],
                albums: artistAlbums
              });
            }
          });
          res.json({ albums });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).json({ error: 'An error occurred while fetching artist albums' });
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while searching for artists' });
    });
});

app.listen(port);
console.log('Server started at http://localhost:' + port);
