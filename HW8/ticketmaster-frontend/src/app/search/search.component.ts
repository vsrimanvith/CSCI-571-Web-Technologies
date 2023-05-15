import { debounceTime } from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TicketmasterService } from '../ticketmaster.service';
import { FormControl, FormGroup, Validators, FormBuilder} from '@angular/forms'
import { switchMap, distinctUntilChanged, filter,tap, finalize} from 'rxjs/operators';

export class searchModel {
  keyword! : any
  distance! : any
  category! : any
  location! : any
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{
  
  item: any;
  options: any;
  table = false;
  id: String = '';
  isLoading = false;
  minLengthTerm = 1;
  eventscard = false;
  keyword : any = "";
  options_list : any;
  filtered_options: any;
  responseData: any = [];
  venue_name: String = '';
  searchdataForm: FormGroup;
  autokey = new FormControl();
  searchModel = new searchModel();

  constructor(private service : TicketmasterService, private fb : FormBuilder,private http:HttpClient){

    this.searchdataForm = new FormGroup({
      keyword :  new FormControl('', Validators.required),
      distance: new FormControl(10),
      category: new FormControl('default', Validators.required),
      location: new FormControl({ value: '', disabled: false }, Validators.required),
      checkbox_: new FormControl(false)
    })

    this.searchdataForm.get('checkbox_')?.valueChanges.subscribe((value) => {
      const control = this.searchdataForm.get('location');
      if (control) {
        if (value) {
          control.reset();
          control.disable();
        } else {
          control.enable();
        }
      }
    });    

  }

  onSelected() {
    this.keyword = this.keyword;
  }

  displayWith(value: any) {
    return value;
  }

  clearSelection() {
    this.keyword = "";
    this.options = [];
  }

  ngOnInit(){
    this.autokey.valueChanges
      .pipe(
        filter(res => {
          if(res === '') this.options=[];
          return res !== null && res.trim().length >= this.minLengthTerm
        }),
        distinctUntilChanged(),
        debounceTime(1000),
        tap(() => {
          this.options = [];
          this.isLoading = true;
        }),
        switchMap(value => this.service.getAutoSuggestData(value)
          .pipe(
            finalize(() => {
              this.isLoading = false
            }),
          )
        )
      )
      .subscribe((data: any) => {
        if (data == undefined || data == '') {
          this.options = [];
        } else {
          if (data && data['_embedded'] && data['_embedded']['attractions']) {
            let attractions = data['_embedded']['attractions']
            this.options_list = [];
          
            for (let i = 0; i < attractions.length; i++) {
              this.options_list.push(attractions[i]['name'])
            }      
            this.isLoading=false;
            this.options = this.options_list
        }
      }
      });
  }
  
  autoSuggestData(input_data_for_suggestion: any)
  {
    if (input_data_for_suggestion === undefined || input_data_for_suggestion === null || input_data_for_suggestion.trim() === '') {
      this.options_list = []
      this.options = []
      return;
    }

    this.service.getAutoSuggestData(input_data_for_suggestion).subscribe(response => {
      let responseData = JSON.parse(JSON.stringify(response));
      if (responseData && responseData['_embedded'] && responseData['_embedded']['attractions']) {
        let attractions = responseData['_embedded']['attractions']
        this.options_list = [];
      
        for (let i = 0; i < attractions.length; i++) {
          this.options_list.push(attractions[i]['name'])
        }      
        this.isLoading=false;
        this.options = this.options_list
      } else {
        console.log("Error: Response data is undefined or missing expected properties.");
      }
    })
    
  }
  
  getDataFromAPI(data: any){
    this.service.getEventsData(data).subscribe((response) => {
      let newResponse = JSON.parse(JSON.stringify(response))
      if(newResponse['_embedded'])
      {
        if(newResponse['_embedded']['events'])
        {
          this.responseData = newResponse['_embedded']['events'];
          this.responseData =  this.responseData.sort((a:any, b:any) => new Date(a.dates.start.localDate).getTime() - new Date(b.dates.start.localDate).getTime());
        }
        else{
          this.responseData = [];
        }
      }
      else{
        this.responseData = [];
      }
      this.table=true;
    }, (error) => {
      console.log('Error is : ',error);
      this.responseData = [];
    })
  }

  callEventsDetails(id: String){
    this.table = false;
    this.eventscard = true;
    this.id = id;
  }

  callVenueDetails(venue_name: String){
    this.venue_name = venue_name;
  }

  togglecomps(){
    this.table = true;
    this.eventscard = false;
  }

  submit_form(){
    this.eventscard = false;
    if(this.searchdataForm.value.checkbox_==='' || this.searchdataForm.value.checkbox_===false || this.searchdataForm.value.checkbox_ === null){
      this.service.getLocation(this.searchdataForm.value).subscribe((res) => {
        let resNew = JSON.parse(JSON.stringify(res));
        if(!resNew['results'] || !resNew['results'][0] || !resNew['results'][0]['geometry']){
          this.responseData=[];
          this.getDataFromAPI({})
        }
        else {
          let geometry = resNew['results'][0]['geometry']
          let lat = geometry['location']['lat']
          let lng = geometry['location']['lng']
  
          let distance = this.searchdataForm.value.distance ? this.searchdataForm.value.distance : 10;
          if(this.searchdataForm.value.category===false || this.searchdataForm.value.category===null){
            this.searchdataForm.value.category='default'
          } 
        
          
          let data = {
            'key' : this.keyword,
            'cat' : this.searchdataForm.value.category,
            'lat' : lat,
            'lng' : lng,
            'dist' : distance
          }
          this.getDataFromAPI(data)
        }
        })
    }

    if(this.searchdataForm.value.checkbox_===true){
      this.service.getCheckedLocation().subscribe((res)=>{
        let resNew = JSON.parse(JSON.stringify(res));
        let lat = resNew['loc'].split(",")[0]
        let lng = resNew['loc'].split(",")[1]
        let distance = this.searchdataForm.value.distance ? this.searchdataForm.value.distance : 10;
        if(this.searchdataForm.value.category===false || this.searchdataForm.value.category===null){
          this.searchdataForm.value.category='Default'
        } 
        let data = {
          'key' : this.keyword,
          'cat' : this.searchdataForm.value.category,
          'lat' : lat,
          'lng' : lng,
          'dist' : distance
        } 
        this.getDataFromAPI(data)
      })
    }
  }

  form_fields_clear()
  {
    this.table=false;
    this.eventscard=false;
    this.searchdataForm.reset({ category: "default",distance:10});
    this.keyword='';
  }

}