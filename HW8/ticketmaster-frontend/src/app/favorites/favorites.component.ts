import { Component } from '@angular/core';
import { TicketmasterService } from '../ticketmaster.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})

export class FavoritesComponent {
  favorites_list: any;

  constructor(private service : TicketmasterService) {}

  ngOnInit(): void {
    this.getFavoritesData();
  }

  //get favorites from localStorage
  getFavoritesData(){
    const storedFavorites = localStorage.getItem('favorites');

    if (storedFavorites) {
      this.favorites_list = JSON.parse(storedFavorites);
    } else {
      this.favorites_list = [];
    }
  }

  //delete favorite from localStorage and table
  deleteFavorite(i:number,row: any) {
    alert("Removed from favorites!")
    let current_favorites = JSON.parse(localStorage.getItem('favorites')!);

    const index = this.favorites_list.indexOf(row);
    if (index !== -1) {
      this.favorites_list.splice(index, 1);
    }
    current_favorites.pop(i)
    localStorage.setItem('favorites', JSON.stringify(current_favorites));
  }
}
