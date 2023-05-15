//
//  ContentView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/8/23.
//

import SwiftUI
import Alamofire
import SwiftyJSON

struct Events: Hashable {
    let id:String
    let datetime: String
    let imageURL: String
    let title: String
    let venue: String
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(datetime)
        hasher.combine(imageURL)
        hasher.combine(title)
        hasher.combine(venue)
    }
}

struct ContentView: View {
    @State private var keyword: String = ""
    @State private var location: String = ""
    @State private var distance: String = "10"
    @State private var category: String = "Default"
    @State private var latitude: String = ""
    @State private var longitude: String = ""
    @State private var search_parameters: Parameters=[:]

    let googlekey = "AIzaSyC7AVnPL4LgDoSrXjTO02NjN3YxXv1bVi0"

    @State private var categories = ["Default","Music", "Sports", "Arts & Theatre", "Film", "Miscellaneous"]
    @State private var showSuggestions = false
    @State private var suggestions: [String] = []
    
    @State private var autoDetectLocation: Bool = false
    @State private var isFilled:Bool = false
    @State private var showResults = false
    @State private var items: [String] = ["Item 1", "Item 2", "Item 3"]
    @State var events: [Events] = []

    @State var isLoading = true
    
    let url = URL(string:"https://i.scdn.co/image/ab6761610000e5eb9e690225ad4445530612ccc9")
    
    
    var body: some View {
        NavigationView {
            VStack{
                Form
                {
                    Section(header: EmptyView()){
                        HStack()
                        {
                            Text("Keyword:")
                                .foregroundColor(.gray)
                                
                            
                            TextField("Required", text: $keyword)
                                .textContentType(.name)
                                .onSubmit{
                                    showSuggestions = true
                                }
                                    
                        }
                        .sheet(isPresented: $showSuggestions){
                            AutoSuggestView(keyword:$keyword)
                        }
                        
                        HStack{
                            Text("Distance:")
                            TextField("", text: $distance)
                                .keyboardType(.numberPad)
                                .foregroundColor(.black)
                            
                        }
                        .foregroundColor(.gray)
                        
                        HStack{
                            Text("Category:")
                            
                            Picker("",selection: $category)
                            {
                                ForEach(categories, id: \.self) {
                                    Text($0)
                                }
                            }
                            .pickerStyle(.menu)
                            //                        .foregroundColor(.gray)
                            .onAppear {category = "Default"}
                        }
                        .foregroundColor(.gray)
                        
                        if !autoDetectLocation {
                            HStack(){
                                Text("Location:")
                                    .foregroundColor(.gray)

                                TextField("Required", text: $location)
                                    .disabled(autoDetectLocation)
                                    .textContentType(.location)
      
                            }
                            
                        }
                        
                        Toggle("Auto-detect my location", isOn: $autoDetectLocation)
                            .foregroundColor(.gray)
                            .onChange(of: autoDetectLocation) { value in
                                                if value {
                                                    location = ""
                                                }
                                            }
                        
                        HStack(spacing: 15) {
                            Spacer()
    
                            HStack{
                                Button("Submit"){}
                                .frame(width: UIScreen.main.bounds.width/4-10)
                                .padding()
                                .background(allFieldsFilled() ? Color.red : Color.gray)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                                .onTapGesture {
                                    if allFieldsFilled(){
                                        self.showResults = true
                                    }
                                    if showResults
                                    {
                                        if(autoDetectLocation){
                                            isLoading = true
                                            AF.request("https://ipinfo.io/json?token=7b827d7a0f6858")
                                                .responseJSON { response in
                                                    switch response.result {
                                                    case .success(let value):
                                                        if let dict = value as? [String: Any], let loc = dict["loc"] as? String {
                                                            let components = loc.components(separatedBy: ",")
                                                            if components.count == 2 {
                                                                let latitude = components[0]
                                                                let longitude = components[1]

                                                                let search_parameters: Parameters = ["keyword":keyword,"category":category,"distance":distance,"latitude":latitude,"longitude":longitude]
                                                                
                                                                
                                                                AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/search",parameters: search_parameters).responseJSON
                                                                { response in
                                                                    switch response.result {
                                                                    case .success(let value):
                                                                        let search_data = JSON(value)
                                                                        var events: [Events] = []
                                                                        for (_,data) in search_data{
                                                                            let id = data["id"].stringValue
                                                                            let datetime = data["datetime"].stringValue
                                                                            let imageUrl = data["imageURL"].stringValue
                                                                            let name = data["event_name"].stringValue
                                                                            let venue = data["venue"].stringValue
                                                                            let event = Events(id:id,datetime: datetime, imageURL: imageUrl, title: name, venue: venue)
                                                                            events.append(event)
                                                                        }
                                                                      isLoading = false

                                                                        self.events = events
                                                                        
                                                                    case .failure(let error):
                                                                        print(error)
                                                                    }
                                                                }
                                                            }
                                                            
                                                        }
                                                    case .failure(let error):
                                                        print(error)

                                                            }
                                                            
                                                        }
                                        }
                                        else{

                                            let lat_long_params:Parameters = ["address":location,"key":googlekey]
                                            
                                            AF.request("https://maps.googleapis.com/maps/api/geocode/json", parameters: lat_long_params).responseJSON { response in
                                                switch response.result {
                                                case .success(let lat_long_response):
                                                    let json = JSON(lat_long_response)
                                                    if let location = json["results"][0]["geometry"]["location"].dictionary {
                                                        if let latitude = location["lat"]?.doubleValue, let longitude = location["lng"]?.doubleValue {
                                                            let search_parameters: Parameters = ["keyword":keyword,"category":category,"distance":distance,"latitude":latitude,"longitude":longitude]
                                                            
                                                            AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/search",parameters: search_parameters)
                                                                .responseJSON { response in
                                                                switch response.result {
                                                                case .success(let value):
                                                                    let search_data = JSON(value)
                                                                    
                                                                    var events: [Events] = []
                                                                    for (_,data) in search_data{
                                                                        let id = data["id"].stringValue
                                                                        let datetime = data["datetime"].stringValue
                                                                        let imageUrl = data["imageURL"].stringValue
                                                                        let name = data["event_name"].stringValue
                                                                        let venue = data["venue"].stringValue
                                                                        let event = Events(id:id,datetime: datetime, imageURL: imageUrl, title: name, venue: venue)
                                                                        events.append(event)
                                                                    }
                                                                  isLoading = false

                                                                    self.events = events
                                                                    
                                                                case .failure(let error):
                                                                    print(error)
                                                                }
                                                            }
                                                        }
                                                        
                                                    }
                                                    
                                                case .failure(let error):
                                                    print(error)
                                                }
                                            }
                                        }
                                        
                                    }
                                }
                            }
                            
                            
                            Spacer()
                            
                            HStack{
                                Button("Clear") {
                                    // Clear input fields
                                    isLoading = true
                                    keyword = ""
                                    location = ""
                                    distance = "10"
                                    category = "Default"
                                    self.isFilled = false
                                    self.showResults = false
                                    self.autoDetectLocation=false
                                }
                                .frame(width: UIScreen.main.bounds.width/4-10)
                                .padding()
                                .background(Color.blue)
                                .foregroundColor(.white)
                                .cornerRadius(10)
                            }
                            
                            
                            
                            Spacer()
                        }
                        .padding(.horizontal)
                        .padding()
                        
                    }
                    
                    if showResults {
                        List {
                            VStack{
                                Text("Results")
                                    .font(.title)
                                    .fontWeight(.bold)
                            }
                            
                            if isLoading {
                                            VStack {
                                                ProgressView()
                                                Text("Please wait...")
                                                    .foregroundColor(.gray)
                                            }
                                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                                        }
                            else{
                                if events.count>0
                                {
                                    ForEach(events, id: \.self) { event in
                                        NavigationLink(destination:EventDetailsView(eventID: event.id,venueName:event.venue),label:
                                                    {
                                            HStack {
                                                Text(event.datetime)
                                                    .opacity(0.5)
                                                    .font(.callout)
                                                    .frame(width: 75)
                                                    .lineLimit(2)

                                                AsyncImage(url: URL(string: event.imageURL)) { image in
                                                    image
                                                        .resizable()
                                                        .cornerRadius(10)
                                                } placeholder: {
                                                    // Placeholder view
                                                }
                                                .frame(width: 57, height: 57)
                                            
                                                
                                                
                                                Text(event.title)
                                                    .fontWeight(.bold)
                                                    .lineLimit(3)
                                                
                                                Text(event.venue)
                                                    .fontWeight(.bold)
                                                    .opacity(0.4)
                                                
                                            }
                                            .padding(.top, 20)
                                            .padding(.bottom, 20)
                                            
                                        }
                                                       
                                        )
                                    }
                                    
                                    
                                }
                                else{
                                    Text("No result available")
                                        .foregroundColor(Color.red)
                                        .font(.title3)
                                }
                            }
                        }
                    }
                }
                
            }
            .navigationTitle("Events Search")
            .navigationBarItems(trailing:
                NavigationLink(destination: FavoritesView()) {
                    Image(systemName: "heart.circle")
                    .font(.headline)
                        .foregroundColor(Color.blue)
                }
            )
}
    }
    
    func allFieldsFilled() -> Bool {
        if keyword.isEmpty || distance.isEmpty || category.isEmpty {
            return false
        }
        if location.isEmpty && !autoDetectLocation {
            return false
        }
        return true
    }
    }




struct FavoritesView: View {
    @AppStorage("favorites") var favoritesData: Data = Data()
    var body: some View {
        let f = loadFavorites()
        VStack{
                if f.count>0
                {
                    List {
                        ForEach(loadFavorites(), id: \.self) { fav in
                            HStack {
                                Text("\(fav.date)")
                                    .font(.caption)
                                Spacer()
                                Text("\(fav.title)")
                                    .font(.caption)
                                    .lineLimit(2)
                                    .truncationMode(.tail)
                                Spacer()
                                Text("\(fav.genre)")
                                    .font(.caption)
                                Spacer()
                                Text("\(fav.venue)")
                                    .font(.caption)
                            }
                        }
                        .onDelete { indices in
                            // Remove the favorites from both the UI and persisted data
                            let favorites = loadFavorites()
                            let updatedFavorites = favorites.enumerated().filter { index, _ in
                                !indices.contains(index)
                            }.map { _, favorite in
                                favorite
                            }
                            saveFavorites(updatedFavorites)
                        }
                    }
                    
                }
                else{
                    Text("No favorites found")
                        .foregroundColor(.red)
                        .font(.title2)
                }
                
            }
            .navigationTitle("Favorites")
    }
    
    func saveFavorites(_ favorites: [Favorite]) {
        // Store the favorites in UserDefaults
        let data = try? JSONEncoder().encode(favorites)
        UserDefaults.standard.set(data, forKey: "favorites")
    }
    
    func loadFavorites() -> [Favorite] {
        if let decodedFavorites = try? JSONDecoder().decode([Favorite].self, from: favoritesData) {
            return decodedFavorites
        }
        return []
    }
}


struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}


