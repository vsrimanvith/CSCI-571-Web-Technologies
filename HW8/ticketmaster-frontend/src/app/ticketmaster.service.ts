import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class TicketmasterService {
  current_favorites: any;
  favorite_status: any;

  constructor(private http:HttpClient) {}

  //when user enters location text
  getLocation(data: any)
  {
    let googlekey = 'AIzaSyC7AVnPL4LgDoSrXjTO02NjN3YxXv1bVi0';
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address='+data.location+'&key='+googlekey)
  }

  //when user checks the auto-detect location checkbox
  getCheckedLocation(){
    return this.http.get('https://ipinfo.io/json?token=7b827d7a0f6858')
  }

  //ticketmaster autosuggestion
  getAutoSuggestData(input_data_for_suggestion: any)
  {
    return this.http.get('https://ticketmaster-backend.wl.r.appspot.com/api/suggest?input_text='+input_data_for_suggestion);
  }

  //get search data - events table
  getEventsData(data: any){
    let dataparsed = JSON.parse(JSON.stringify(data))
    let querystring = "?keyword=" + dataparsed.key + "&category=" + dataparsed.cat + "&distance=" + dataparsed.dist + "&latitude=" + dataparsed.lat + "&longitude=" + dataparsed.lng;
    return this.http.get('https://ticketmaster-backend.wl.r.appspot.com/api/search' + querystring);
  }

  //get data for events card mat-tab
  getMoreInfoData(id: String){
    return this.http.get('https://ticketmaster-backend.wl.r.appspot.com/api/details?id=' + id);
  }

  //get data for venue card mat-tab
  getVenueData(venue_name: String){
    return this.http.get('https://ticketmaster-backend.wl.r.appspot.com/api/venue?venue_name=' + venue_name);
  }

  //get data for artists/team card mat-tab - spotify
  getSpotifyData(music_artists: string){
    const encoded_music_artists = encodeURIComponent(music_artists);
    return this.http.get('https://ticketmaster-backend.wl.r.appspot.com/api/spotify?artists_list=' + encoded_music_artists);
  }

  //check favorite status
  checkFavorite(fav_id: String)
  {
    this.current_favorites = JSON.parse(localStorage.getItem('favorites')!);
    let favorite_status = false;
    if(this.current_favorites!==null){
    for (const k of this.current_favorites) {
      if (k.id === fav_id) {
        favorite_status = true;
        break;
      }
    }
    return favorite_status;
  }
  else{
    return false;
  }
  }
}
