//
//  EventDetailsView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/9/23.
//

import SwiftUI
import Alamofire
import SwiftyJSON
import SimpleToast


class EventsData: ObservableObject {
    @Published var id: String
    @Published var name: String
    @Published var date: String
    @Published var artistteam: String
    @Published var genres: String
    @Published var venue: String
    @Published var pricerange: String
    @Published var ticketstatus: String
    @Published var seatmapurl: String
    @Published var fburl: String
    @Published var twitterurl: String
    @Published var ticketmasterurl: String
    @Published var background: String
    @Published var isFavorite: Bool

    init(id:String,name: String, date: String,artistteam: String,genres: String,venue: String,pricerange: String,ticketstatus: String,seatmapurl: String,fburl: String,twitterurl: String,ticketmasterurl: String,background: String,isFavorite:Bool) {
        self.id = id
        self.name = name
        self.date = date
        self.artistteam = artistteam
        self.genres = genres
        self.venue = venue
        self.pricerange = pricerange
        self.ticketstatus = ticketstatus
        self.seatmapurl = seatmapurl
        self.fburl = fburl
        self.twitterurl = twitterurl
        self.ticketmasterurl = ticketmasterurl
        self.background = background
        self.isFavorite = isFavorite
    }
}

struct Favorite: Codable,Identifiable,Hashable {
    var id: String
    var date: String
    var title: String
    var genre: String
    var venue: String
    
    init(id:String,date: String, title: String, genre: String, venue: String) {
            self.id = id
            self.date = date
            self.title = title
            self.genre = genre
            self.venue = venue
        }
}

struct Artists: Identifiable{
    var id = UUID()

    var followers: String
    var image1: String
    var image2: String
    var image3: String
    var mainimage: String
    var name: String
    var popularity: Int
    var spotifyurl: String
    var popvalue: Float
    init(followers:String,image1: String,image2: String,image3: String,mainimage: String, name: String, popularity: Int, spotifyurl: String,popvalue: Float) {
            self.followers = followers
            self.image1 = image1
            self.image2 = image2
            self.image3 = image3
            self.mainimage = mainimage
            self.name = name
            self.popularity = popularity
            self.spotifyurl = spotifyurl
            self.popvalue = popvalue
        }
}

class VenueData: ObservableObject {
    @Published var venue: String
    @Published var address: String
    @Published var phone: String
    @Published var openhours: String
    @Published var generalrule: String
    @Published var childrule: String
    @Published var google_lat: String
    @Published var google_long: String
    
    init(venue: String,address: String,phone: String,openhours: String,generalrule: String,childrule: String,google_lat: String,google_long: String) {
        self.venue = venue
        self.address = address
        self.phone = phone
        self.openhours = openhours
        self.generalrule = generalrule
        self.childrule = childrule
        self.google_lat = google_lat
        self.google_long = google_long
    }
}


struct EventDetailsView: View {
    var eventID: String
    var venueName: String
    @State var isLoading = true
    @AppStorage("favorites") var favoritesData: Data = Data()
    @State var artists: [Artists] = []

    @ObservedObject var eventdata: EventsData = EventsData(id:"",name: "", date: "", artistteam: "", genres: "", venue: "", pricerange: "", ticketstatus: "", seatmapurl: "", fburl: "", twitterurl: "", ticketmasterurl: "", background: "",isFavorite:false)
    @ObservedObject var venuedata: VenueData = VenueData(venue: "",address: "",phone: "",openhours: "",generalrule: "",childrule: "",google_lat: "",google_long: "")
    
    var body: some View {
        ZStack{
            Group{
                if isLoading {
                    VStack {
                        ProgressView()
                        Text("Please wait...")
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .onAppear {
                        isLoading = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
                            isLoading = false
                        }
                    }
                }
                else {
                    TabView {
                        
                        
                        EventsView(eventsData: eventdata)
                            .tabItem {
                                Image(systemName: "text.bubble.fill")
                                    .foregroundColor(.gray)
                                Text("Events")
                                    .foregroundColor(.gray)
                            }
                        
                        ArtistsTeamView(artists:$artists)
                            .tabItem {
                                Image(systemName: "guitars.fill")
                                    .foregroundColor(.gray)
                                Text("Artist/Team")
                                    .foregroundColor(.gray)
                            }
                        
                        VenueDetailsView(venueData: venuedata,eventsData: eventdata)
                            .tabItem {
                                Image(systemName: "location.fill")
                                    .foregroundColor(.gray)
                                Text("Venue")
                                    .foregroundColor(.gray)
                            }
                    }
                    .navigationBarTitle("", displayMode: .inline)
                    
                }
            }
            .onAppear{
                let event_parameters: Parameters = ["id":eventID]
                let venue_parameters:Parameters = ["venue_name":venueName]
                
                AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/details",parameters: event_parameters).responseJSON { response in
                    
                    switch response.result {
                    case .success(let value):
                        let data = JSON(value)
                        
                        print("event resp:", data)
                        let id = data["id"].stringValue
                        let name = data["name"].stringValue
                        let date = data["date"].stringValue
                        let artistteam = data["artists"].stringValue
                        let genres = data["genres"].stringValue
                        let venue = data["venue"].stringValue
                        let pricerange = data["pricerange"].stringValue
                        let ticketstatus = data["ticket_status"].stringValue
                        let seatmapurl = data["seatmap"].stringValue
                        let ticketmasterurl = data["ticketmasterurl"].stringValue
                        let fburl = data["fburl"].stringValue
                        let twitterurl = data["twitterurl"].stringValue
                        let background = data["background"].stringValue
                        let favorites = getFavorites()
                        let isFavorite = favorites.contains(where: { $0.id == id })
                        let musicartists = data["musicartists"].stringValue
                        
                        self.eventdata.id = id
                        self.eventdata.name = name
                        self.eventdata.date = date
                        self.eventdata.artistteam = artistteam
                        self.eventdata.genres = genres
                        self.eventdata.venue = venue
                        self.eventdata.pricerange = pricerange
                        self.eventdata.ticketstatus = ticketstatus
                        self.eventdata.seatmapurl = seatmapurl
                        self.eventdata.fburl = fburl
                        self.eventdata.twitterurl = twitterurl
                        self.eventdata.ticketmasterurl = ticketmasterurl
                        self.eventdata.background = background
                        self.eventdata.isFavorite = isFavorite
                        
                        let artist_parameters:Parameters = ["artists_list":musicartists]
                        
                        AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/spotify",parameters: artist_parameters).responseJSON { response in
                            switch response.result {
                            case .success(let value):
                                let spotify_data = JSON(value)
                                print("spotify",spotify_data)
                                var artists: [Artists] = []
                                for (_,data) in spotify_data{
                                    let followers = data["followers"].stringValue
                                    let image1 = data["image1"].stringValue
                                    let image2 = data["image2"].stringValue
                                    let image3 = data["image3"].stringValue
                                    let mainimage = data["mainimage"].stringValue
                                    let name = data["name"].stringValue
                                    let popularity = data["popularity"].intValue
                                    let spotifyurl = data["spotifyurl"].stringValue
                                    let popvalue = data["popvalue"].floatValue
                                    
                                    let artist = Artists(followers: followers, image1: image1, image2: image2, image3: image3, mainimage: mainimage, name: name, popularity: popularity, spotifyurl: spotifyurl,popvalue: popvalue)
                                    artists.append(artist)
                                }
                                self.artists = artists
                            case .failure(let error):
                                print("Error: \(error)")
                            }
                        }
                        
                    case .failure(let error):
                        print("Error: \(error)")
                    }
                    
                }
                
                
                AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/venue",parameters: venue_parameters).responseJSON { response in
                    switch response.result {
                    case .success(let value):
                        let data = JSON(value)
                        let venue = data["venue"].stringValue
                        let address = data["address"].stringValue
                        let phone = data["phone"].stringValue
                        let openhours = data["openhours"].stringValue
                        let generalrule = data["generalrule"].stringValue
                        let childrule = data["childrule"].stringValue
                        let google_lat = data["google_lat"].stringValue
                        let google_long = data["google_long"].stringValue
                        self.venuedata.venue = venue
                        self.venuedata.address = address
                        self.venuedata.phone = phone
                        self.venuedata.openhours = openhours
                        self.venuedata.generalrule = generalrule
                        self.venuedata.childrule = childrule
                        self.venuedata.google_lat = google_lat
                        self.venuedata.google_long = google_long
                        
                    case .failure(let error):
                        print("Error: \(error)")
                    }
                }
//                isLoading = false;
            }
        }
    }
    
    private func getFavorites() -> [Favorite] {
            do {
                let decoder = JSONDecoder()
                let favorites = try decoder.decode([Favorite].self, from: favoritesData)
                return favorites
            } catch {
                return []
            }
        }
    }

struct EventsView: View {
    @ObservedObject var eventsData: EventsData
    @AppStorage("favorites") var favoritesData: Data = Data()
    @State private var favorites: [Favorite] = []
    @State private var showToast = false
    @State var backgroundColor = Color.green
    @State private var id = ""
    @State private var date = ""
    @State private var name = ""
    @State private var genres = ""
    @State private var venue = ""
    
    private let toastOptions = SimpleToastOptions(
        alignment: .bottom,
        hideAfter: 2,
        backdropColor: Color.black.opacity(0.8),
        animation: .default,
        modifierType: .fade
        )


    var body: some View {
        
        VStack
        {
            HStack
            {
                Text(eventsData.name)
                    .font(.title3)
                    .fontWeight(.bold)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
            .padding(.bottom,5)
//            .padding(.top,-25)

            HStack
            {
                Text("Date")
                    .font(.headline)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.leading)

                Spacer()

                Text("Artist | Team")
                    .font(.headline)
                    .lineLimit(1)
                    .fontWeight(.bold)

            }

            HStack
            {
                Text(eventsData.date)
                    .font(.body)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))

                Spacer()

                Text(eventsData.artistteam)
                    .font(.body)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))

            }

            HStack
            {
                Text("Venue")
                    .font(.headline)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.leading)
                    .padding(.top, 10)

                Spacer()

                Text("Genre")
                    .font(.headline)
                    .fontWeight(.bold)
                    .padding(.top, 10)

            }

            HStack
            {
                Text(eventsData.venue)
                    .font(.body)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))

                Spacer()

                Text(eventsData.genres)
                    .font(.body)
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
            }

            HStack
            {
                Text("Price Range")
                    .font(.headline)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.leading)
                    .padding(.top, 10)

                Spacer()

                Text("Ticket Status")
                    .font(.headline)
                    .fontWeight(.bold)
                    .padding(.top, 10)

            }

            HStack
            {
                Text(eventsData.pricerange)
                    .font(.body)
                    .padding(.top, -30)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))


                Spacer()
                HStack{
                    Text(eventsData.ticketstatus)
                        .font(.headline)
                        .lineLimit(1)
                        .padding(.top,7)
                        .padding(.bottom,7)
                        .padding(.leading,25)
                        .padding(.trailing,25)
                        .foregroundColor(Color.white)
                        .background(eventsData.ticketstatus == "On Sale" ? Color.green :
                                        (eventsData.ticketstatus == "Rescheduled" || eventsData.ticketstatus == "Postponed" ? Color.orange :
                                            (eventsData.ticketstatus == "OffSale" ? Color.red :
                                                (eventsData.ticketstatus == "Canceled" ? Color.black : backgroundColor))))
                }
                .cornerRadius(5)


            }
            
            HStack{
                Button(action: {
                    eventsData.isFavorite.toggle()
                    
                    if eventsData.isFavorite {
                        let favorite = Favorite(id: eventsData.id, date: eventsData.date, title: eventsData.name, genre: eventsData.genres, venue: eventsData.venue)
                        saveFavorite(favorite)
                        showToast = true // Show toast when event is saved to favorites
                    } else {
                        deleteFavorite(eventsData.id)
                        showToast = true // Show toast when event is removed from favorites
                    }
                }) {
                    let title = eventsData.isFavorite ? "Remove F..." : "Save Event"
                    Text(title)
                        .font(.headline)
                }
                
                .padding()
                .foregroundColor(Color.white)
                .background(eventsData.isFavorite ? Color.red : Color.blue)
                .cornerRadius(15)

            }
            

            

            VStack
            {
                AsyncImage(url:  URL(string: eventsData.seatmapurl)) { image in
                    image
                        .resizable()
                } placeholder: {
                    // Placeholder view
                }
                .frame(width: 250, height: 250)
                
                
                HStack{
                    Text("Buy Ticket At:")
                        .font(.body)
                        .fontWeight(.bold)
                    
                    if let ticketmasterURL = URL(string: eventsData.ticketmasterurl ?? "") {
                        Link("Ticketmaster", destination: ticketmasterURL)
                    }
                }
            
                HStack{
                    Text("Share on:")
                        .font(.body)
                        .fontWeight(.bold)

                    Image("Facebook")
                                .resizable()
                                .frame(width: 40, height: 40)
                                .onTapGesture {
                                    UIApplication.shared.open(URL(string:eventsData.fburl)!, options: [:], completionHandler: nil)
                                }

                    Image("Twitter")
                                .resizable()
                                .frame(width: 40, height: 40)
                                .onTapGesture {
                                    
//                                    guard let eventName = eventsData.name, let url = eventsData.ticketmasterurl else { return }
                                    let tweetText = "\(eventsData.name) \(eventsData.ticketmasterurl)"
                                                                if let encodedTweetText = tweetText.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed),
                                                                   let urlObj = URL(string: "https://twitter.com/intent/tweet?text=\(encodedTweetText)%0A") {
                                                                    UIApplication.shared.open(urlObj)
                                                                }
                                                            
                    
                    
//                                    UIApplication.shared.open(URL(string:"https://twitter.com/intent/tweet?text=\(eventsData.name)"+"&url="+eventsData.ticketmasterurl)?, options: [:], completionHandler: nil)
                                }
                }
            }
                Spacer()
        }
        .navigationBarTitle("", displayMode: .inline)
        .padding(.top)
        .padding(.leading)
        .padding(.trailing)
            .simpleToast(isPresented: $showToast, options: toastOptions) {
                Text(eventsData.isFavorite ? "Added to favorites." : "Removed Favorite")
                    .padding(.leading,55)
                    .padding(.trailing,55)
                    .padding(.top,25)
                    .padding(.bottom,25)
                    .background(.ultraThinMaterial)
                    .foregroundColor(.black)
                    .cornerRadius(10)
 
            }
    }
    private func saveFavorite(_ favorite: Favorite) {
            var favorites = getFavorites()
            favorites.append(favorite)
            do {
                let encoder = JSONEncoder()
                let data = try encoder.encode(favorites)
                favoritesData = data
            } catch {
                print("Error saving favorites")
            }
        }

    private func deleteFavorite(_ id:String) {
            var favorites = getFavorites()
            favorites.removeAll(where: { $0.id == id})
            do {
                let encoder = JSONEncoder()
                let data = try encoder.encode(favorites)
                favoritesData = data
            } catch {
                print("Error deleting favorite")
            }
        }
    
    private func getFavorites() -> [Favorite] {
            do {
                let decoder = JSONDecoder()
                let favorites = try decoder.decode([Favorite].self, from: favoritesData)
                return favorites
            } catch {
                return []
            }
        }
    

}


//struct ArtistDetailsView: View {
//
//    var body: some View {
//        Text("Artists")
//    }
//
//}

//struct VenueView: View {
//
//    var body: some View {
//        Text("venue")
//    }
//
//}


//struct EventDetailsView_Previews: PreviewProvider {
//    static var previews: some View {
//        let eventID: String = "exampleEventID"
//        return EventDetailsView(eventID: eventID)
//    }
//}
