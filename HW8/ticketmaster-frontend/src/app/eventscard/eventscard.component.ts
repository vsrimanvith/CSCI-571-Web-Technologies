import { TicketmasterService } from '../ticketmaster.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-eventscard',
  templateUrl: './eventscard.component.html',
  styleUrls: ['./eventscard.component.css']
})

export class EventscardComponent {
  
  @Input() event_id: any;
  @Input() venue_name: any;
  @Output() togglecomps = new EventEmitter<string>();

  artists: any;
  followers: any;
  fav_status: any;
  fburl: String='';
  lines: number = 2;
  artist_names: any;
  date : String = '';
  isFavorite = false;
  venue : String ='';
  genres : String ='';
  favorites_list: any[];
  current_favorites:any;
  venue_phone:String='';
  twitterurl: String='';
  genres_string:String='';
  venue_address:String='';
  price_range : String ='';
  event_title : String = '';
  venue_name_data:String='';
  priceranges_string:String='';
  artists_team_string:String='';
  ticket_status_exists : String='';
  ticket_status : String ='';
  bgcolor : String ='';
  ticketmasterurl : String ='';
  seatmapurl : String ='';
  child_rule : String ='';
  general_rule: String = '';
  open_hours:String='';
  phone_number:String='';
  address:String='';
  music_artists:any=[];
  position: any = {};
  isCollapsedopenhrs: boolean = false;
  isCollapsedgeneralrule: boolean = false;
  isCollapsedchildrule: boolean = false;
  buttonTextOpenhours: String = 'Show More';
  buttonTextGeneralrule: String = 'Show More';
  buttonTextChildrule: String = 'Show More';

  marker:any = {
    position: { lat: 0, lng: 0 },
  };

  mapOptions:any = {
    center: { lat: 0, lng: 0},
    zoom : 14,
  }

  constructor(private service : TicketmasterService) {this.favorites_list = [];}

  ngOnInit(): void {
    this.getMoreInfo();
    this.getVenue();
  }

  changeIconFillColor(date: any, event_title: any, genres: any, venue: any) {
    if (this.service.checkFavorite(this.event_id)) {
      this.deleteFavorite(event_title);
      this.fav_status=false;
    } 
    else 
    {
      this.addFavorite(date,event_title, genres, venue);
      this.fav_status=true;
    }
  }


  getVenue(){
    this.service.getVenueData(this.venue_name).subscribe((res) => {
    let venuecardData = JSON.parse(JSON.stringify(res));

    //venuename
    if(venuecardData['_embedded']){
      if(venuecardData['_embedded']['venues'])
      {
        this.venue_name_data = venuecardData['_embedded']['venues'][0]['name'];
      }
      else{
        this.venue_name_data = '';
      }
    }
    else{
      this.venue_name_data = '';
    }
     
    //venueaddress
    var address = [];
    var add_string = '';
    if(venuecardData['_embedded']){
      if(venuecardData['_embedded']['venues'])
      {
        if(venuecardData['_embedded']['venues'][0]['address'])
        {
          if(venuecardData['_embedded']['venues'][0]['address']['line1']){
            address.push(venuecardData['_embedded']['venues'][0]['address']['line1']);
          }
        }
        if(venuecardData['_embedded']['venues'][0]['city']){
          if(venuecardData['_embedded']['venues'][0]['city']['name']){
            address.push(venuecardData['_embedded']['venues'][0]['city']['name']);
          }
        }
        if(venuecardData['_embedded']['venues'][0]['state']){
          if(venuecardData['_embedded']['venues'][0]['state']['name']){
            address.push(venuecardData['_embedded']['venues'][0]['state']['name']);
          }
        }
      }
    }
    
    if(address.length>0){
    this.venue_address = address.join(', ');
    }
    else{
      this.venue_address = '';
    }

    //venuephone
    if(venuecardData['_embedded']){
      if(venuecardData['_embedded']['venues'])
      {
        if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']){
          if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['phoneNumberDetail']){
            this.venue_phone = venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['phoneNumberDetail'];
          }
          else{
            this.venue_phone = '';
          }
        }
        else{
          this.venue_phone = '';
        }
      }
      else{
        this.venue_phone = '';
      }
    }
    else{
      this.venue_phone = '';
    }

    //openhours
    if(venuecardData['_embedded']){
      if(venuecardData['_embedded']['venues'])
      {
        if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']){
          if(venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['openHoursDetail']){
            this.open_hours = venuecardData['_embedded']['venues'][0]['boxOfficeInfo']['openHoursDetail'];
          }
          else{
            this.open_hours = '';
          }
        }
        else{
          this.open_hours = '';
        }
      }
      else{
        this.open_hours = '';
      }
    }
    else{
      this.open_hours = '';
    }

    //generalrule
    if(venuecardData['_embedded'])
    {
      if(venuecardData['_embedded']['venues']){
        if(venuecardData['_embedded']['venues'][0]['generalInfo']){
          if(venuecardData['_embedded']['venues'][0]['generalInfo']['generalRule']){
            this.general_rule = venuecardData['_embedded']['venues'][0]['generalInfo']['generalRule'];
          }
          else{
            this.general_rule = '';
          }
        }
        else{
          this.general_rule = '';
        }
      }
      else{
        this.general_rule = '';
      }
    }
    else{
      this.general_rule = '';
    }

    //childrule
    if(venuecardData['_embedded'])
    {
      if(venuecardData['_embedded']['venues']){
        if(venuecardData['_embedded']['venues'][0]['generalInfo']){
          if(venuecardData['_embedded']['venues'][0]['generalInfo']['childRule']){
            this.child_rule = venuecardData['_embedded']['venues'][0]['generalInfo']['childRule'];
          }
          else{
            this.child_rule = '';
          }
        }
        else{
          this.child_rule = '';
        }
      }
      else{
        this.child_rule = '';
      }
    }
    else{
      this.child_rule = '';
    }


    //googlemaps
    var google_lat:number=0;
    var google_long:number=0;
    if(venuecardData['_embedded']){
      if(venuecardData['_embedded']['venues']){
        if(venuecardData['_embedded']['venues'][0]['location']){
          if(venuecardData['_embedded']['venues'][0]['location']['latitude']){
            google_lat = parseFloat(venuecardData['_embedded']['venues'][0]['location']['latitude']);
          }
          if(venuecardData['_embedded']['venues'][0]['location']['longitude']){
            google_long = parseFloat(venuecardData['_embedded']['venues'][0]['location']['longitude']);
          }
        }
      }
    }
    
    this.marker = {
      position: { lat: google_lat, lng: google_long },
    };
    this.mapOptions = {
      center: { lat: google_lat, lng: google_long},
      zoom : 14,
    }
    })

  }
 
  getMoreInfo()
  {
    this.fav_status = this.service.checkFavorite(this.event_id);
    this.service.getMoreInfoData(this.event_id).subscribe((eventcardresponse) => {
    let eventcardData = JSON.parse(JSON.stringify(eventcardresponse));

      //title
      if(eventcardData['name']) {
        this.event_title = eventcardData['name'];
      }
      else{
        this.event_title = '';
      }

      //date
      if(eventcardData['dates'])
      {
        if(eventcardData['dates']['start'])
        {
          if(eventcardData['dates']['start']['localDate'])
          {
            this.date = eventcardData['dates']['start']['localDate'];
          }
          else{
            this.date = '';
          }
        }
        else{
          this.date = '';
        }
      }
      else{
        this.date=''
      }
      
      //artist/team

      let artists_team =[];
      var artstr='';
      if(eventcardData['_embedded'])
      {
        if(eventcardData['_embedded']['attractions'])
        {
          for (var i=0; i < eventcardData['_embedded']['attractions'].length; i++) {
            artists_team.push(eventcardData['_embedded']['attractions'][i]['name']);
          }

          if(artists_team.length==1) this.artists_team_string = artists_team[0];
          else{

          for (var i=0; i < artists_team.length-1; i++) {
            artstr = artists_team.join(' | ');
          }
          this.artists_team_string = artstr;
        }
      }

        else{
          this.artists_team_string = ''
        }
      }
      else{
        this.artists_team_string = ''
      }

      //venue
      if(eventcardData['_embedded']){
        if(eventcardData['_embedded']['venues'])
        {
          this.venue = eventcardData['_embedded']['venues'][0]['name'];
        }
        else{
          this.venue = '';
        }
      }
      else{
        this.venue = '';
      }
      

      //genres

      var genres_list = [];  

      if(eventcardData['classifications'])
      {
        if(eventcardData['classifications'][0]['segment']){
          genres_list.push(eventcardData['classifications'][0]['segment']['name']);
        }
        if(eventcardData['classifications'][0]['genre']){
          genres_list.push(eventcardData['classifications'][0]['genre']['name']);
        }
        if(eventcardData['classifications'][0]['subGenre']){
          genres_list.push(eventcardData['classifications'][0]['subGenre']['name']);
        }
        if(eventcardData['classifications'][0]['type']){
          genres_list.push(eventcardData['classifications'][0]['type']['name']);
        }
        if(eventcardData['classifications'][0]['subType']){
          genres_list.push(eventcardData['classifications'][0]['subType']['name']); 
        }     
      }
      
    genres_list = genres_list.filter(v => v !== 'Undefined'); 
    
    if(genres_list.length>0){
    this.genres_string = genres_list.join(' | ');
    }
    else{
      this.genres_string = '';
    }

    //priceranges
    var minmax = [];
    if(eventcardData['priceRanges']){
      if(eventcardData['priceRanges'][0]['min'])
      {
        minmax.push(eventcardData['priceRanges'][0]['min']); 
      }
      if(eventcardData['priceRanges'][0]['max'])
      {
        minmax.push(eventcardData['priceRanges'][0]['max']); 
      }
    }

    if(minmax.length>0){
      this.priceranges_string = minmax.join('-');
    }
    else{
      this.priceranges_string = '';
    }

    //ticketstatus
    var ticket_status_code="";
    var background="";
    var ticket_status = '';

    if(eventcardData['dates']){
      if(eventcardData['dates']['status'])
      {
        if(eventcardData['dates']['status']['code']){
          ticket_status = eventcardData['dates']['status']['code'];
          if(ticket_status == "onsale"){
            ticket_status_code = "On Sale"
            background = 'green'}
        if(ticket_status == "rescheduled"){
            ticket_status_code = "Rescheduled";
            background = 'orange';}
        if(ticket_status == "offsale"){
            ticket_status_code = "Off Sale";
            background = 'red';}
        if(ticket_status == "cancelled" || ticket_status == "canceled"){
            ticket_status_code = "Canceled";
            background = 'black';}
        if(ticket_status == "postponed"){
            ticket_status_code = "Postponed";
            background = 'orange';}
          
        this.ticket_status = ticket_status_code;
        this.bgcolor = background;
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

    //ticketmasterurl
    this.ticketmasterurl = eventcardData['url']?eventcardData['url']:'';
    
    //seatmap
    if(eventcardData['seatmap']){
      if(eventcardData['seatmap']['staticUrl']){
        this.seatmapurl = eventcardData['seatmap']['staticUrl'];
      }
      else{
        this.seatmapurl = '';
      }
    }
    else{
      this.seatmapurl = '';
    }

    
      this.fburl = "https://www.facebook.com/sharer/sharer.php?u="+eventcardData['url'];
      this.twitterurl = "https://twitter.com/intent/tweet?text=Check "+eventcardData['name']+" on Ticketmaster. &url="+eventcardData['url'];

      this.music_artists=[];
      for(let i=0;i<eventcardData._embedded.attractions.length;i++)
      {
        if(eventcardData._embedded.attractions[i].classifications[0].segment.name === "Music")
        {
          this.music_artists.push(eventcardData._embedded.attractions[i]['name'])
        }
      }

      if(this.music_artists.length>0)
      {
      this.service.getSpotifyData(this.music_artists).subscribe((res) => {
        let resNew = JSON.parse(JSON.stringify(res));
        this.artist_names = this.music_artists;
        this.artists=[];

        for(let i=0;i<resNew.albums.length;i++)
        {
          this.artists.push(resNew.albums[i])
          this.artists[i]['artist']['followers']['total'] = this.artists[i]['artist']['followers']['total'].toLocaleString('en-US');
        }
        })
      }
      else{
        this.music_artists=[]
      }
    })
  }

  addFavorite(date: any, event_title: any, genres: any, venue: any) {
    alert("Event Added to Favorites!");
    let favorite = {
      'id':this.event_id,
      'date' : date,
      'event_title' : event_title,
      'category' : genres,
      'venue' : venue
    }

    // Retrieve current favorites from local storage
    let currentFavorites = [];

    if (localStorage.getItem('favorites')) {
      currentFavorites = JSON.parse(localStorage.getItem('favorites')!);
    }

    // Ensure that the parsed value is an array
    if (!Array.isArray(currentFavorites)) {
      currentFavorites = [];
    }

    // Append the new favorite object to the list
    currentFavorites.push(favorite);

    // Save the updated list back to local storage
    localStorage.setItem('favorites', JSON.stringify(currentFavorites));
  }

  deleteFavorite(event_title: any) {
    alert("Removed from favorites!")
    this.current_favorites = JSON.parse(localStorage.getItem('favorites')!);
    const index = this.current_favorites.indexOf(event_title);
    if (index !== -1) {
      this.current_favorites.splice(index, 1);
    }
    this.current_favorites.pop(index)
    localStorage.setItem('favorites', JSON.stringify(this.current_favorites));
  }

  toggleTextOpenhours() {
    this.isCollapsedopenhrs = !this.isCollapsedopenhrs;
    this.buttonTextOpenhours = this.isCollapsedopenhrs ? 'Show Less':'Show More';
  }

  toggleTextGeneralrule() {
    this.isCollapsedgeneralrule = !this.isCollapsedgeneralrule;
    this.buttonTextGeneralrule = this.isCollapsedgeneralrule ? 'Show Less':'Show More';
  }

  toggleTextChildrule() {
    this.isCollapsedchildrule = !this.isCollapsedchildrule;
    this.buttonTextChildrule = this.isCollapsedchildrule ? 'Show Less':'Show More';
  }

  back_function(){
      this.togglecomps.emit();
  }
}
