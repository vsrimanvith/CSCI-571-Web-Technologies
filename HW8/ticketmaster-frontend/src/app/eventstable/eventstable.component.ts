import { TicketmasterService } from '../ticketmaster.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-eventstable',
  templateUrl: './eventstable.component.html',
  styleUrls: ['./eventstable.component.css']
})

export class EventstableComponent {

  @Input() events: any;
  @Output() callEventsDetails: EventEmitter<any> = new EventEmitter();
  @Output() callVenueDetails: EventEmitter<any> = new EventEmitter();

  fav_status:any;

  constructor(private service : TicketmasterService) {}

  ngOnInit() {}

  infoCard(id: String){
    this.callEventsDetails.emit(id);
  }

  venueCard(venue_name: String){
    this.callVenueDetails.emit(venue_name);
  }

  checkfavorite(id: String)
  {
    this.fav_status = this.service.checkFavorite(id);
  }
}
