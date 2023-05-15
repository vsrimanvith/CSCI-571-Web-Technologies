// Keys:
// google geocode = AIzaSyC7AVnPL4LgDoSrXjTO02NjN3YxXv1bVi0
// ipinfo:  curl "ipinfo.io/104.32.130.226?token=26a62cccdf90a0"
// ticketmaster = kAy1tmlKRL9aCMvPMnWLGLhGLGQG3vLN


function reset_form_fields(event)
{
    const temp = document.getElementById("keyword");
    temp.value='';

    const dist = document.getElementById("distance");
    dist.value='';

    document.getElementById("cat").value='default';
    document.getElementById("check").checked=false;

    const locc = document.getElementById("location");
    locc.value='';

    document.getElementById("location").style.display="block";
    document.getElementById('events-table').style.display='none';
    document.getElementById('event-card').style.display='none';
    document.getElementById('arrowcard').style.display='none';
    document.getElementById('venue-card').style.display='none';
    document.getElementById('events-table1').style.display = 'none';
}

function hide_location_box()
{
    var checkbox_status = document.getElementById("check");
    var text = document.getElementById("location");
    
    if (checkbox_status.checked == true)
    {
    text.style.display = "none";
    text.value = '';
    text.required = false;
    }

    else 
    {
    text.style.display = "block";
    text.value = '';
    text.required = true;
    }
}

function form_data_submit()
{
    var keyword = document.getElementById("keyword").value;
    var distance = document.getElementById("distance").value ? document.getElementById("distance").value : 10;
    var category = document.getElementById("cat").value;
    var checkbox_status = document.getElementById("check");
    var input_location = document.getElementById("location").value;

    if(keyword==""||(input_location=="" && checkbox_status.checked==false)) return;

    if(checkbox_status.checked == false){    
        // call google gecoding api
        var geocode_request = new XMLHttpRequest();
        input_location = input_location.replace(/' '/gi, "+");
        var geocode_key = 'AIzaSyC7AVnPL4LgDoSrXjTO02NjN3YxXv1bVi0';
        geocode_request.open("GET", "https://maps.googleapis.com/maps/api/geocode/json"+"?address="+input_location+"&key="+geocode_key,true);

        geocode_request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                geocode_request = JSON.parse(geocode_request.responseText);
                if(geocode_request['results'].length==0){
                    displayErrorMessage();
                }
                else{var latitude = geocode_request['results'][0]['geometry']['location']['lat'];
                var longitude = geocode_request['results'][0]['geometry']['location']['lng'];

                input_data_search(keyword, distance, category, latitude, longitude);
            }
            }
        };

        geocode_request.send();
    }

    else{
        //call ipinfo
        var ipinfo_request = new XMLHttpRequest();
        ipinfo_request.open("GET", "https://ipinfo.io/json?token=26a62cccdf90a0", true);

        ipinfo_request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) 
            {
                ipinfo_request = JSON.parse(ipinfo_request.responseText);
                var latitude = ipinfo_request['loc'].split(",")[0]
                var longitude = ipinfo_request['loc'].split(",")[1]
                input_data_search(keyword, distance, category, latitude, longitude);
            }
        };
        ipinfo_request.send();
    }
}

function assign_segment_id(category)
{
    var segmentId = "";
    if(category == "music") segmentId="KZFzniwnSyZfZ7v7nJ";
    if(category == "sports") segmentId="KZFzniwnSyZfZ7v7nE";
    if(category == "arts") segmentId="KZFzniwnSyZfZ7v7na";
    if(category == "film") segmentId="KZFzniwnSyZfZ7v7nn";
    if(category == "miscellaneous") segmentId="KZFzniwnSyZfZ7v7n1";
    if(category == "default") segmentId=null;
    return segmentId;
}

function displayErrorMessage(){
    var eventstable = document.getElementById('events-table');
    eventstable.style.display = 'none';
    var eventcard = document.getElementById('event-card');
    eventcard.style.display = 'none';

    var arrowcard = document.getElementById('arrowcard');
    arrowcard.style.display = 'none';

    var venuecard = document.getElementById('venue-card');
    venuecard.style.display = 'none';

    var eventstable1 = document.getElementById('events-table1');
    eventstable1.style.display = 'block';
    let out = "";
    out=`<span style="background-color: white;color: red;margin-top: 30px;font-weight: 700;display: inline-block;margin: auto;height: 30px;padding-top: 10px;">No Records found</span>`;
    eventstable1.innerHTML = out;
}

function input_data_search(keyword, distance, category, latitude, longitude)
{
    var data_fetch_request = new XMLHttpRequest();
    var category = category
    var segmentId = assign_segment_id(category);
    var distance = distance

    if(segmentId!=null)
    {
        data_fetch_request.open("GET", "https://python-172999.wl.r.appspot.com"+"/"+"search?keyword="+keyword+ "&segmentId="+segmentId+"&radius="+distance+"&unit="+"miles"+"&latitude="+latitude+"&longitude="+longitude,true);
    }

    else
    {
        data_fetch_request.open("GET", "https://python-172999.wl.r.appspot.com"+"/"+"search?keyword="+keyword+"&radius="+distance+"&unit="+"miles"+"&latitude="+latitude+"&longitude="+longitude,true);

    }                    

    data_fetch_request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) 
        {
            search_fetched_data = JSON.parse(data_fetch_request.responseText);

            if(search_fetched_data['_embedded']===undefined){

                displayErrorMessage();
            }
            else if(search_fetched_data['_embedded']['events'])
            {
            display_data_for_table(search_fetched_data['_embedded']['events']);
            }
            else display_data_for_table([]);
        }
    };
    data_fetch_request.send();
}

function table_data_display(){
    var tabledata = document.getElementById('events-table');
    if (tabledata.style.display == 'none') {
        tabledata.style.display = 'block';
    }
}

function display_data_for_table(events){

    var eventcard = document.getElementById('event-card');
    eventcard.style.display = 'none';

    var arrowcard = document.getElementById('arrowcard');
    arrowcard.style.display = 'none';

    var venuecard = document.getElementById('venue-card');
    venuecard.style.display = 'none';
    
    var eventstable1 = document.getElementById('events-table1');
    eventstable1.style.display = 'none';


    var eventstable = document.getElementById('events-table');
    eventstable.style.display = 'block';
    let out = "";
    
        document.querySelector("#thead").innerHTML = `
        <tr>
            <th style="width: 140px;padding:15px;">Date</th>
            <th style="width: 145px;padding:15px;">Icon</th>
            <th onclick="sortTable(2)" style="width: 570px;padding:5px;cursor:pointer;" >Event</th>
            <th style="width: 170px;padding:5px;cursor:pointer;" onclick="sortTable(3)">Genre</th>
            <th style="width: 200px;padding:5px;cursor:pointer;" onclick="sortTable(4)">Venue</th>
        </tr>
        `
        let placeholder = document.querySelector("#display-data");
        
    
        for(let event of events)
        {   date = event['dates']['start']['localDate']?event['dates']['start']['localDate']:'';
            time = event['dates']['start']['localTime']?event['dates']['start']['localTime']:'';
            genre_segment = event['classifications'][0]['segment']['name']?event['classifications'][0]['segment']['name']:'';
            venue_table = event['_embedded']['venues'][0]['name']?event['_embedded']['venues'][0]['name']:'';
            src_img = event['images'][0]['url']?event['images'][0]['url']:''
            out += `
                <tr >
                <td style="padding:15px">${date} <br>${time}</td>
                <td style="padding:15px"><img src='${src_img}' style="width: 90px;height: 55px;"></td>
                <td id="tempHover" style="padding:15px;cursor:pointer;" onclick = "event_details('${event['id']}'),event_info_display()" >${event['name']}</td>
                <td style="padding:15px">${genre_segment}</td>
                <td style="padding:15px">${venue_table}</td>
                 </tr>
            `;
        }
    
        placeholder.innerHTML = out;
        table_data_display();
}

// Credits: This code snippet is taken from w3 schools website - https://www.w3schools.com/howto/howto_js_sort_table.asp
function sortTable(n) 
{
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("events-table");
  switching = true;
  
  dir = "asc";
  
  while (switching) {
    
    switching = false;
    rows = table.rows;
    
    for (i = 1; i < (rows.length - 1); i++) {

      shouldSwitch = false;

      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
   
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch = true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        switching = true;
      }
    }
  }
}



function event_info_display(){
    var eventcard = document.getElementById('event-card');
    var arrowcard = document.getElementById('arrowcard');
    if (eventcard.style.display == 'none') {
        eventcard.style.display = 'block';
    }
    if (arrowcard.style.display == 'none') {
        arrowcard.style.display = 'block';
    }

}

function event_details(event_id)
{
    var event_details_request = new XMLHttpRequest();
    event_details_request.open("GET", "https://python-172999.wl.r.appspot.com" + "/" + "event_details?id="+event_id, true);
    event_details_request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) 
        {
            event_details_data = JSON.parse(event_details_request.responseText);
            display_data_for_event_card(event_details_data);
            const scroll_ref = document.getElementById("event-card");
            scroll_ref.scrollIntoView();
        }
};
event_details_request.send();

}

function display_data_for_event_card(events_data)
{
    var eventcard = document.getElementById('event-card');
    eventcard.style.display = 'block';

    var arrowcard = document.getElementById('arrowcard');
    arrowcard.style.display = 'block';

    var venuecard = document.getElementById('venue-card');
    venuecard.style.display = 'none';

    document.getElementById('venue-card').style.display='none';

    document.getElementById("date-time-title").removeAttribute("hidden");
    document.getElementById("date-time").removeAttribute("hidden");

    document.getElementById("artist-team-title").removeAttribute("hidden");
    document.getElementById("artist-team").removeAttribute("hidden");

    document.getElementById("venue-title").removeAttribute("hidden"); 
    document.getElementById("venue").removeAttribute("hidden"); 

    document.getElementById("genre-title").removeAttribute("hidden");
    document.getElementById("genre").removeAttribute("hidden"); 
 
    document.getElementById("price-title").removeAttribute("hidden");
    document.getElementById("price").removeAttribute("hidden"); 
 
    document.getElementById("ticket-status-title").removeAttribute("hidden");
    document.getElementById("ticket-status").removeAttribute("hidden"); 
 
    document.getElementById("buy-ticket-at-title").removeAttribute("hidden");
    document.getElementById("buy-ticket-at").removeAttribute("hidden");  

    //event-title
    document.getElementById("event-title").innerHTML = events_data['name'];

    //date-time
    var date = events_data['dates']['start']['localDate']?events_data['dates']['start']['localDate']:'';
    var time = events_data['dates']['start']['localTime']?events_data['dates']['start']['localTime']:'';
    var date_time = date + " " + time;

    document.getElementById("date-time").innerHTML = date_time;

    if(document.getElementById("date-time").innerHTML == ''){
        document.getElementById("date-time-title").setAttribute("hidden", true);
        document.getElementById("date-time").setAttribute("hidden", true); 
    }

    //artist-team
    var artists_team=[];
    var artists_team_url=[];

    if(events_data['_embedded']['attractions'])
    {
        for (var i=0; i < events_data['_embedded']['attractions'].length; i++) {
            artists_team.push(events_data['_embedded']['attractions'][i]['name']);
            artists_team_url.push(events_data['_embedded']['attractions'][i]['url'])
        }
    }

    if(artists_team.length == 0){
        document.getElementById("artist-team-title").setAttribute("hidden", true); 
        document.getElementById("artist-team").setAttribute("hidden", true); 
    }

    let artist_out='';
    let artist_placeholder = document.querySelector("#artist-team");

    for(var i=0; i < artists_team.length; i++)
    {
        if(i==artists_team.length-1)
        {
            if(artists_team_url[i])
            {
            artist_out += `
            <span> <a href="${artists_team_url[i]}" target="_blank" style="text-decoration:none;color: #00abf4">${artists_team[i]}</a></span>
            `;
            }
            else{
                artist_out += `
                <span>${artists_team[i]}</span>
                `;
                } 
        }
        
        else
        {
            if(artists_team_url[i])
            {   
                artist_out += `
                <span> <a href="${artists_team_url[i]}" target="_blank" style="text-decoration:none;color: #00abf4;">${artists_team[i]}</a> |</span>
                `;
            }
            else
            {
                artist_out += `
                <span>${artists_team[i]} |</span>
                `;
            }
        }
        
    }
    
    artist_placeholder.innerHTML = artist_out;
    

    //venue
    var venue='';
    if(events_data['_embedded']['venues'][0]['name']) {
    venue=events_data['_embedded']['venues'][0]['name'];
    }
    
    if(venue == ''){
        document.getElementById("venue-title").setAttribute("hidden", true); 
        document.getElementById("venue").setAttribute("hidden", true); 
    }
    document.getElementById("venue").innerHTML = venue;

    // genres
    var genres = [];  

    if(events_data['classifications'][0]['segment']) genres.push(events_data['classifications'][0]['segment']['name']);
    if(events_data['classifications'][0]['genre']) genres.push(events_data['classifications'][0]['genre']['name']);
    if(events_data['classifications'][0]['subGenre']) genres.push(events_data['classifications'][0]['subGenre']['name']);
    if(events_data['classifications'][0]['type']) genres.push(events_data['classifications'][0]['type']['name']);
    if(events_data['classifications'][0]['subType']) genres.push(events_data['classifications'][0]['subType']['name']);     

    genres = genres.filter(v => v !== 'Undefined'); 
    var genre_string = genres.join(' | ');

    document.getElementById("genre").innerHTML = genre_string
    if(document.getElementById("genre").innerHTML == ''){
        document.getElementById("genre-title").setAttribute("hidden", true);
        document.getElementById("genre").setAttribute("hidden", true);
    }

    
    //price
    document.getElementById("price").innerHTML = events_data['priceRanges'] ? events_data['priceRanges'][0]['min'] +" - " + events_data['priceRanges'][0]['max'] + " USD":''
    if(document.getElementById("price").innerHTML == ''){
        document.getElementById("price-title").setAttribute("hidden", true);
        document.getElementById("price").setAttribute("hidden", true)  
    }


    //ticket_status
    ticket_status =  events_data['dates']['status']['code']
    var ticket_status_code="";
    var background="";
    if(ticket_status == "onsale"){
        ticket_status_code = "On Sale"
        background = 'green'}
    if(ticket_status == "rescheduled"){
        ticket_status_code = "Rescheduled";
        background = 'orange';}
    if(ticket_status == "offsale"){
        ticket_status_code = "Off Sale";
        background = 'red';}
    if(ticket_status == "cancelled"){
        ticket_status_code = "Canceled";
        background = 'black';}
    if(ticket_status == "postponed"){
        ticket_status_code = "Postponed";
        background = 'orange';}

    document.getElementById("ticket-status").innerHTML = ticket_status_code;
    document.getElementById("ticket-status").style.backgroundColor = background;

    if(document.getElementById("ticket-status").innerHTML == ''){
        document.getElementById("ticket-status-title").setAttribute("hidden", true);
        document.getElementById("ticket-status").setAttribute("hidden", true);  
    }


    //buy-ticket-at
    var buy_ticket_at=''
    if(events_data['url']) buy_ticket_at = events_data['url'];
    
    document.getElementById("buy-ticket-at").href = buy_ticket_at
    if(document.getElementById("buy-ticket-at").innerHTML == ''){
        document.getElementById("buy-ticket-at-title").setAttribute("hidden", true);
        document.getElementById("buy-ticket").setAttribute("hidden", true); 
    }

    //seat-map
    document.getElementById("seat-map").src = events_data['seatmap']?events_data['seatmap']['staticUrl']:''
}




function venue_details()
{
    document.getElementById("venue-card").style.display='none';
    venue = document.getElementById("venue").innerText
    var venue_details_request = new XMLHttpRequest();
    venue_details_request.open("GET", "https://python-172999.wl.r.appspot.com" + "/" + "venue_details?keyword="+venue, true);
    venue_details_request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) 
        {
            venue_details_data = JSON.parse(venue_details_request.responseText);
            display_data_for_venue_card(venue_details_data);
            
        }
        else{
            document.getElementById("venue-card").style.display='none';
        }
};
venue_details_request.send();
}



function arrowcardhide(){
    var arrowcard = document.getElementById('arrowcard');
    if (arrowcard.style.display == 'none') {
        arrowcard.style.display = 'block';
    } 
}

function display_data_for_venue_card(venue_data)
{
    document.getElementById("venue-card-title").removeAttribute("hidden");
    document.getElementById("venue-card-image").removeAttribute("hidden");

    var address,city,stateCode,postalCode,title;
    var moreevents = '';
    var geo_string="https://www.google.com/maps/search/?api=1&query=+";
    var temp = venue_data['_embedded'];
    if(temp)
    {
        if(temp['venues']!==undefined)
        {
            if(temp['venues'][0]['address']!==undefined)
            {
                if(temp['venues'][0]['address']['line1']!==undefined)
                {
                    address = venue_data['_embedded']['venues'][0]['address']['line1'];
                }
                else
                {
                    address = "N/A";
                }
            }
            else
            {
                address = "N/A";
            }

            if(temp['venues'][0]['city']!==undefined)
            {
                if(temp['venues'][0]['city']['name']!==undefined)
                {
                    city = venue_data['_embedded']['venues'][0]['city']['name'];
                }
                else{
                    city = "N/A";
                }
            }
            else
            {
                city = "N/A";
            }
            if(temp['venues'][0]['state']!==undefined)
            {
                if(temp['venues'][0]['state']['stateCode']!==undefined)
                {
                    stateCode = venue_data['_embedded']['venues'][0]['state']['stateCode'];
                }
                else{
                    stateCode = "N/A";
                }
            }
            else{
                stateCode = "N/A";
            }

            if(temp['venues'][0]['postalCode']!==undefined)
            {
                postalCode = venue_data['_embedded']['venues'][0]['postalCode'];
            }

            if(temp['venues'][0]['name']!==undefined || temp['venues'][0]['name']!=="undefined")
            {
                title = venue_data['_embedded']['venues'][0]['name'];
            }
            else
            {
                title = "N/A";
            }

            if(temp['venues'][0]['url']!==undefined)
            {
                moreevents = venue_data['_embedded']['venues'][0]['url'];
            }
             
            else
            {
                moreevents = "N/A";
            }
            }
}
     
    if(title == '' && postalCode == '' && stateCode =='' && city == '' && address =='')
    {
        var arrowcard = document.getElementById('arrowcard');
        arrowcard.style.display = 'none';

        var venuecard = document.getElementById('venue-card');
        venuecard.style.display = 'none';
    }

    else
    {
    document.getElementById("venue-card-title").innerHTML = title;

    if(title !== undefined)
    {
        geo_string += title;
        geo_string += " ";
    }

    if(document.getElementById("venue-card-image").getAttribute("hidden"))
    {
        document.getElementById("venue-card-image").removeAttribute("hidden");
    }
   
    if(venue_data['_embedded']['venues'][0]['images']!==undefined)
    {
        document.getElementById("venue-card-image").src = venue_data['_embedded']['venues'][0]['images'][0]['url'];
    }
    
    else
    {
        document.getElementById("venue-card-image").setAttribute("hidden", true) 
    }
    

    document.getElementById("address").innerHTML = address;
    if(address!="N/A")
    {
        geo_string += address;
        geo_string += " ";
    }

    document.getElementById("city").innerHTML = city;
    if(city!="N/A")
    {
        geo_string += city;
        geo_string += " ";
    }

    document.getElementById("state-code").innerHTML = stateCode;
    if(stateCode!="N/A")
    {
        geo_string += stateCode;
        geo_string += " ";
    }


    document.getElementById("postal-code").innerHTML = postalCode;
    if(postalCode!="N/A")
    {
        geo_string += postalCode;
        geo_string += " ";
    }

    if(geo_string == "https://www.google.com/maps/search/?api=1&query=+")
    {
        document.getElementById("google-maps").href = '';
    }
    else
    {
        document.getElementById("google-maps").href = geo_string;
    }
    document.getElementById("more-events").style.display='block';

    if(moreevents!="N/A"){
    document.getElementById("more-events").href = moreevents;
    }
    else
    {
        document.getElementById("more-events").style.display='none';
    }

    var venuecard = document.getElementById('venue-card');
    venuecard.style.display = 'block';

    document.getElementById("venue-card").style.display='block';
    var arrowcard = document.getElementById('arrowcard');
    arrowcard.style.display = 'none';
    const scroll_ref = document.getElementById("venue-card");
    scroll_ref.scrollIntoView();
}
}
