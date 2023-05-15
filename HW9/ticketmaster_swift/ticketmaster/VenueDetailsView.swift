//
//  VenueDetailsView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/10/23.
//

import SwiftUI
import MapKit
import CoreLocation

struct VenueDetailsView: View {
    @ObservedObject var venueData: VenueData
    @ObservedObject var eventsData: EventsData
    @State private var showSheet:Bool = false
    
    struct AnnotationItem: Identifiable {
        let id = UUID()
        let latitude:Double
        let longitude:Double
        
        var coordinate:CLLocationCoordinate2D{
            CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
        }
    }


    
    var body: some View {

        VStack{
            VStack{
                Text(eventsData.name)
                    .font(.title3)
                    .fontWeight(.bold)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }

            VStack{
                Text("Name")
                    .fontWeight(.bold)
                    .padding(.top,10)

                Text(venueData.venue)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
                
                Text("Address")
                    .fontWeight(.bold)
                    .padding(.top,10)


                Text(venueData.address)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
                
                Text("Phone Number")
                    .fontWeight(.bold)
                    .padding(.top,10)


                Text(venueData.phone)
                    .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
            }
            
            VStack{
                Text("Open Hours")
                    .fontWeight(.bold)
                    .padding(.top,10)

                ScrollView{
                    Text(venueData.openhours)
                        .padding()
                        .lineLimit(nil)
                        .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
                        .padding(.top,-20)

                }
                .frame(maxHeight: 60)
                
                Text("General Rule")
                    .fontWeight(.bold)
                    .padding(.top,10)

                ScrollView{
                    Text(venueData.generalrule)
                        .padding()
                        .lineLimit(nil)
                        .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
                        .padding(.top,-20)
                }
                .frame(maxHeight: 60)


                Text("Child Rule")
                    .fontWeight(.bold)
                    .padding(.top,10)


                ScrollView{
                    Text(venueData.childrule)
                        .padding()
                        .lineLimit(nil)
                        .foregroundColor(Color(hue: 1.0, saturation: 0.026, brightness: 0.46))
                        .padding(.top,-20)
                }
                .frame(maxHeight: 60)
            }

            
                Button(action: {
                    showSheet.toggle()
                }) {
                    Text("Show venue on maps")
                        .padding()
                        .foregroundColor(Color.white)
                        .background(Color.red)
                        .cornerRadius(15)
                        .padding(.top,10)
                }
                .sheet(isPresented: $showSheet) {
                    if let lat = Double(venueData.google_lat), let long = Double(venueData.google_long) {
                        @State var coordinateRegion = MKCoordinateRegion(
                            center: CLLocationCoordinate2D(latitude: lat, longitude: long),
                            span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
                        )
                        
                        Map(coordinateRegion: $coordinateRegion, annotationItems: [
                            AnnotationItem(latitude: lat, longitude: long)
                        ]) { place in
                            MapMarker(coordinate: place.coordinate, tint: .red)
                        }
                        .padding()
                        .onAppear {
                            coordinateRegion = MKCoordinateRegion(
                                center: CLLocationCoordinate2D(latitude: lat, longitude: long),
                                span: MKCoordinateSpan(latitudeDelta: 0.1, longitudeDelta: 0.1)
                            )
                        }
                    }
                }

                        
                    }
                
                
            }

        }


//struct VenueDetailsView_Previews: PreviewProvider {
//    static var previews: some View {
//        VenueDetailsView()
//    }
//}
