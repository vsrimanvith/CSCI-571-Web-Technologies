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
    if(category == "Music") segmentId="KZFzniwnSyZfZ7v7nJ";
    if(category == "Sports") segmentId="KZFzniwnSyZfZ7v7nE";
    if(category == "Arts & Theatre") segmentId="KZFzniwnSyZfZ7v7na";
    if(category == "Film") segmentId="KZFzniwnSyZfZ7v7nn";
    if(category == "Miscellaneous") segmentId="KZFzniwnSyZfZ7v7n1";
    if(category == "Default") segmentId='';

    let geoPoint = geohash.encode(lat, long, 7);
    let final_search_response = []
    let ticketmaster_search_url = segmentId?'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ticketmasterkey+'&keyword='+keyword+'&segmentId='+segmentId+'&radius='+distance+'&unit=miles'+'&geoPoint='+geoPoint:'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ticketmasterkey+'&keyword='+keyword+'&radius='+distance+'&unit=miles'+'&geoPoint='+geoPoint; 
    
    axios(ticketmaster_search_url).then(response => {
        let newresponse = response.data

        for(let i=0;i<newresponse._embedded.events.length;i++)
        {
          temp = {}
          temp["id"] = newresponse["_embedded"]["events"][i]["id"]
          
          if(newresponse["_embedded"]["events"][i]["dates"]["start"]){
            if(newresponse["_embedded"]["events"][i]["dates"]["start"]["localTime"]){
              temp["datetime"] = newresponse["_embedded"]["events"][i]["dates"]["start"]["localDate"] + "|" + newresponse["_embedded"]["events"][i]["dates"]["start"]["localTime"].substring(0, 5)
            }
            else{
              temp["datetime"] = newresponse["_embedded"]["events"][i]["dates"]["start"]["localDate"] + " "
            }
          }
          // temp["datetime"] = newresponse["_embedded"]["events"][i]["dates"]["start"]["localDate"] + "|" + (newresponse["_embedded"]["events"][i]["dates"]["start"]?newresponse["_embedded"]["events"][i]["dates"]["start"]["localTime"].substring(0, 5):" ");
          temp["imageURL"] = newresponse["_embedded"]["events"][i]["images"][0]["url"];
          temp["event_name"]= newresponse["_embedded"]["events"][i]["name"];
          temp["venue"] = newresponse["_embedded"]["events"][i]['_embedded']['venues'][0]['name'];
          final_search_response.push(temp)
        }

        final_search_response.sort((a, b) => {
          let dateA = new Date(a.datetime.split("|")[0] + "T" + a.datetime.split("|")[1])
          let dateB = new Date(b.datetime.split("|")[0] + "T" + b.datetime.split("|")[1])
          return dateA - dateB
        })

        // console.log("resp:",final_search_response)
        res.json(final_search_response)
        // res.json(response.data)

    }).catch(err => {
        res.send(err);
    });
})

app.get('/api/details',function(req,res){
    let id = req.query.id;
    details_url = "https://app.ticketmaster.com/discovery/v2/events/"+id+"?apikey="+ticketmasterkey;

    axios(details_url).then(response => {
      let detailsresponse = response.data
      details_temp = {}
      details_temp["id"] = detailsresponse["id"].toString()
      details_temp["name"] = detailsresponse["name"]
      details_temp["date"] = detailsresponse['dates']['start']['localDate']

      let artists_team =[];
      var artstr='';
      if(detailsresponse['_embedded'])
      {
        if(detailsresponse['_embedded']['attractions'])
        {
          for (var i=0; i < detailsresponse['_embedded']['attractions'].length; i++) {
            artists_team.push(detailsresponse['_embedded']['attractions'][i]['name']);
          }

          if(artists_team.length==1) artists_team_string = artists_team[0];
          else{

          for (var i=0; i < artists_team.length-1; i++) {
            artstr = artists_team.join(' | ');
          }
          artists_team_string = artstr;
        }
      }

        else{
          artists_team_string = ''
        }
      }
      else{
        artists_team_string = ''
      }

      details_temp["artists"] = artists_team_string
      details_temp["venue"] = detailsresponse['_embedded']['venues'][0]['name']
      var genres_list = [];  

      if(detailsresponse['classifications'])
      {
        if(detailsresponse['classifications'][0]['segment']){
          genres_list.push(detailsresponse['classifications'][0]['segment']['name']);
        }
        if(detailsresponse['classifications'][0]['genre']){
          genres_list.push(detailsresponse['classifications'][0]['genre']['name']);
        }
        if(detailsresponse['classifications'][0]['subGenre']){
          genres_list.push(detailsresponse['classifications'][0]['subGenre']['name']);
        }
        if(detailsresponse['classifications'][0]['type']){
          genres_list.push(detailsresponse['classifications'][0]['type']['name']);
        }
        if(detailsresponse['classifications'][0]['subType']){
          genres_list.push(detailsresponse['classifications'][0]['subType']['name']); 
        }     
      }
      
      genres_list = genres_list.filter(v => v !== 'Undefined'); 
      
      if(genres_list.length>0){
      genres_string = genres_list.join(' | ');
      }
      else{
        genres_string = '';
      }

      details_temp["genres"] = genres_string


      var minmax = [];
      if(detailsresponse['priceRanges']){
        if(detailsresponse['priceRanges'][0]['min'])
        {
          minmax.push(detailsresponse['priceRanges'][0]['min']); 
        }
        if(detailsresponse['priceRanges'][0]['max'])
        {
          minmax.push(detailsresponse['priceRanges'][0]['max']); 
        }
      }

      if(minmax.length>0){
        priceranges_string = minmax.join('-');
      }
      else{
        priceranges_string = 'N/A';
      }

      details_temp["pricerange"] = priceranges_string


    var ticket_status_code="";
    var background="";
    var ticket_status = '';

    if(detailsresponse['dates']){
      if(detailsresponse['dates']['status'])
      {
        if(detailsresponse['dates']['status']['code']){
          ticket_status = detailsresponse['dates']['status']['code'];
          if(ticket_status == "onsale"){
            ticket_status_code = "Onsale"
            background = 'green'}
        if(ticket_status == "rescheduled"){
            ticket_status_code = "Rescheduled";
            background = 'orange';}
        if(ticket_status == "offsale"){
            ticket_status_code = "OffSale";
            background = 'red';}
        if(ticket_status == "cancelled" || ticket_status == "canceled"){
            ticket_status_code = "Canceled";
            background = 'black';}
        if(ticket_status == "postponed"){
            ticket_status_code = "Postponed";
            background = 'orange';}
          
        ticket_status = ticket_status_code;
        bgcolor = background;
        }
        else{
          ticket_status = '';
        }
      }
      else{
        ticket_status = '';
      }
    }
    else{
      ticket_status = '';
    }

    details_temp["ticket_status"] = ticket_status
    details_temp["background"] = background

    //ticketmasterurl
    details_temp["ticketmasterurl"] = detailsresponse['url']?detailsresponse['url']:'';
    
    //seatmap
    if(detailsresponse['seatmap']){
      if(detailsresponse['seatmap']['staticUrl']){
        seatmapurl = detailsresponse['seatmap']['staticUrl'];
      }
      else{
        seatmapurl = '';
      }
    }
    else{
      seatmapurl = '';
    }

    details_temp["seatmap"] = seatmapurl
    details_temp["fburl"] = "https://www.facebook.com/sharer/sharer.php?u="+detailsresponse['url']
    details_temp["twitterurl"] = "https://twitter.com/intent/tweet?text=Check "+detailsresponse['name']+" on Ticketmaster. &url="+detailsresponse['url']

    music_artists=[];
    for(let i=0;i<detailsresponse._embedded.attractions.length;i++)
    {
      if(detailsresponse._embedded.attractions[i].classifications[0].segment.name === "Music")
      {
        music_artists.push(detailsresponse._embedded.attractions[i]['name'])
      }
    }
    if(music_artists.length>0){
      let encoded_music_artists = encodeURIComponent(music_artists);
      details_temp["musicartists"] = encoded_music_artists
    }
    else{
      details_temp["musicartists"] = []
    }
    
    res.json(details_temp)

    }).catch(err => {
        res.send(err);
    }); 
})

app.get('/api/venue',function(req,res){
    let venue_name = req.query.venue_name;
    venue_url = "https://app.ticketmaster.com/discovery/v2/venues?apikey="+ticketmasterkey+"&keyword="+venue_name;

    axios(venue_url).then(response => {
      venuecardData = response.data
      venue_temp = {}

      if(venuecardData['_embedded']){
        if(venuecardData['_embedded']['venues'])
        {
          venue_name_data = venuecardData['_embedded']['venues'][0]['name'];
        }
        else{
          venue_name_data = '';
        }
      }
      else{
        venue_name_data = '';
      }
       
      //venueaddress
      var address = [];
      var add_string = '';
      if(venuecardData['_embedded'])
      {
        if(venuecardData['_embedded']['venues'])
        {
          if(venuecardData['_embedded']['venues'][0]['address'])
          {
            if(venuecardData['_embedded']['venues'][0]['address']['line1'])
            {
              venue_address = venuecardData['_embedded']['venues'][0]['address']['line1'];
            }
          }
        }
      }

      else{
        venue_address = 'N/A';
      }
  
      //venuephone
      if(venuecardData['_embedded']){
        if(venuecardData['_embedded']['venues'])
        {
          if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']){
            if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['phoneNumberDetail']){
              venue_phone = venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['phoneNumberDetail'];
            }
            else{
              venue_phone = 'N/A';
            }
          }
          else{
            venue_phone = 'N/A';
          }
        }
        else{
          venue_phone = 'N/A';
        }
      }
      else{
        venue_phone = 'N/A';
      }
  
      //openhours
      if(venuecardData['_embedded']){
        if(venuecardData['_embedded']['venues'])
        {
          if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']){
            if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['openHoursDetail']){
              open_hours = venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['openHoursDetail'];
            }
            else{
              open_hours = 'N/A';
            }
          }
          else{
            open_hours = 'N/A';
          }
        }
        else{
          open_hours = 'N/A';
        }
      }
      else{
        open_hours = 'N/A';
      }
  
      //generalrule
      if(venuecardData['_embedded'])
      {
        if(venuecardData['_embedded']['venues']){
          if(venuecardData['_embedded']['venues'][0]['generalInfo']){
            if(venuecardData['_embedded']['venues'][0]['generalInfo']['generalRule']){
              general_rule = venuecardData['_embedded']['venues'][0]['generalInfo']['generalRule'];
            }
            else{
              general_rule = 'N/A';
            }
          }
          else{
            general_rule = 'N/A';
          }
        }
        else{
          general_rule = 'N/A';
        }
      }
      else{
        general_rule = 'N/A';
      }
  
      //childrule
      if(venuecardData['_embedded'])
      {
        if(venuecardData['_embedded']['venues']){
          if(venuecardData['_embedded']['venues'][0]['generalInfo']){
            if(venuecardData['_embedded']['venues'][0]['generalInfo']['childRule']){
              child_rule = venuecardData['_embedded']['venues'][0]['generalInfo']['childRule'];
            }
            else{
              child_rule = 'N/A';
            }
          }
          else{
            child_rule = 'N/A';
          }
        }
        else{
          child_rule = 'N/A';
        }
      }
      else{
        child_rule = 'N/A';
      }

      venue_temp["venue"] = venue_name_data
      venue_temp["address"] = venue_address
      venue_temp["phone"] = venue_phone
      venue_temp["openhours"] = open_hours
      venue_temp["generalrule"] = general_rule
      venue_temp["childrule"] = child_rule
      venue_temp["google_lat"] = parseFloat(venuecardData['_embedded']['venues'][0]['location']['latitude']);
      venue_temp["google_long"] = parseFloat(venuecardData['_embedded']['venues'][0]['location']['longitude']);

      res.json(venue_temp)

    }).catch(err => {
        res.send(err);
    });
})


// SPOTIFY

var SpotifyWebApi = require('spotify-web-api-node');
const { response } = require('express');

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

  if (artistsstring === '') {
    res.send([]);
    return;
  }
  
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

          function formatNumber(num) {
            let million = 1000000;
            let thousand = 1000;
            
            if (num >= million) {
              return Math.floor(num / million) + 'M';
            } else if (num >= thousand) {
              return Math.floor(num / thousand) + 'K';
            } else {
              return num.toString();
            }
          }

          spotify_data = {albums}

          console.log("length:",spotify_data.albums.length)
          spotify_response = []

          for(let i=0;i<spotify_data.albums.length;i++)
          {
            response_data = {}
            console.log("fff:",spotify_data["albums"])
            response_data["spotifyurl"] = spotify_data["albums"][i]["artist"]["external_urls"]["spotify"]
            response_data["followers"] = formatNumber(spotify_data["albums"][i]["artist"]["followers"]["total"]).toString()
            response_data["mainimage"] = spotify_data["albums"][i]["artist"]["images"][0]["url"]
            response_data["name"] = spotify_data["albums"][i]["artist"]["name"]
            response_data["popularity"] = spotify_data["albums"][i]["artist"]["popularity"]
            response_data["image1"] = spotify_data["albums"][i]["albums"][0]["image"]
            response_data["image2"] = spotify_data["albums"][i]["albums"][1]["image"]
            response_data["image3"] = spotify_data["albums"][i]["albums"][2]["image"]
            response_data["popvalue"] = (spotify_data["albums"][i]["artist"]["popularity"])/100
            spotify_response.push(response_data)
          }
          
          console.log(spotify_response)
          
          res.json(spotify_response);
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
