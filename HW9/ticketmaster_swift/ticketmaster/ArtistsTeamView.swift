//
//  ArtistsTeamView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/9/23.
//

import SwiftUI

struct ArtistsTeamView: View {
    let url = URL(string:"https://i.scdn.co/image/ab6761610000e5eb9e690225ad4445530612ccc9")
    let spotifyUrl = URL(string: "https://www.spotify.com/")!
    
    @Binding var artists:[Artists]
    
    var body: some View {
        if artists.count>0{
            ZStack{
                ScrollView{
                    VStack{
                            ForEach(artists) {artist in
                            VStack{
                                HStack{
                                    HStack{
                                        AsyncImage(url: URL(string: artist.mainimage)) { image in
                                            image
                                                .resizable()
                                                .cornerRadius(10)
                                        } placeholder: {
                                        }
                                        .frame(width: 100, height: 100)
                                    }
                                    .frame(width:110,height: 110)
                                    
                                    VStack{
                                        HStack{
                                            Text(artist.name)
                                                .font(.title2)
                                                .fontWeight(.bold)
                                                .foregroundColor(.white)
                                            Spacer()
                                        }
                                        Spacer()

                                        HStack{
                                            Text(artist.followers)
                                                .font(.title2)
                                                .foregroundColor(.white)
                                            
                                            Text("Followers")
                                                .font(.subheadline)
                                                .foregroundColor(.white)
                                            Spacer()
                                        }
                                        Spacer()

                                        HStack{
                                            Image("Spotify")
                                                .resizable()
                                                .frame(width: 30, height: 30)
                                                .onTapGesture {
                                                    UIApplication.shared.open(URL(string:artist.spotifyurl)!, options: [:], completionHandler: nil)
                                                }
                                            Text("Spotify")
                                                .foregroundColor(.green)
                                                .font(.body)
                                            Spacer()

                                        }
                                    }
                                    VStack{
                                        
                                        Text("Popularity")
                                            .font(.body)
                                            .foregroundColor(.white)
                                        
                                        ZStack {
                                            Circle()
                                                .stroke(
                                                    Color(hue: 0.075, saturation: 0.562, brightness: 0.599),
                                                    lineWidth: 15
                                                )
                                            
                                            Circle()
                                                .trim(from: 0, to: CGFloat(artist.popvalue))
                                                .stroke(
                                                    Color.orange,
                                                    lineWidth: 15
                                                    
                                                )
                                            Text(String(artist.popularity))
                                                .font(.body)
                                                .foregroundColor(.white)
                                            
                                        }
                                        .frame(width: 50, height: 50)
                                        Spacer()
                                        
                                        
                                    }
                                }
                                .padding(.bottom,20)
                                
                                HStack{
                                    Text("Popular Albums")
                                        .font(.title2)
                                        .bold()
                                        .foregroundColor(.white)
                                    
                                    Spacer()
                                }
                                HStack{
                                    AsyncImage(url: URL(string: artist.image1)) { image in
                                        image .resizable()
                                            .cornerRadius(10)
                                        
                                    } placeholder: {
                                        ProgressView()
                                    }
                                    .frame(width: 90, height: 90)
                                    
                                    Spacer()
                                    
                                    AsyncImage(url: URL(string: artist.image2)) { image in
                                        image .resizable()
                                            .cornerRadius(10)
                                        
                                    } placeholder: {
                                        ProgressView()
                                    }
                                    .frame(width: 90, height: 90)
                                    
                                    Spacer()
                                    
                                    AsyncImage(url: URL(string: artist.image3)) { image in
                                        image .resizable()
                                            .cornerRadius(10)
                                        
                                    } placeholder: {
                                        ProgressView()
                                    }
                                    .frame(width: 100, height: 100)
                                }
                            }
                            .padding(.bottom,10)
                            .padding(.top)
                            .padding(.leading,10)
                            .padding(.trailing,10)
                            .background(Color(hue: 1.0, saturation: 0.054, brightness: 0.268))
                            .cornerRadius(10)
                            Spacer()
                            
                        }
                            .padding(.bottom,12)
                            .padding(.trailing,10)
                    }
                    }
                    
                }
            .padding(.top,10)
            .padding(.bottom,10)
            .padding(.leading,10)
            .padding(.trailing,13)
            }
        else{
                Text("No music related artist details to show")
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
        }
    }

    }
        
                                        
                                        
                                        
                                        
                                        
                                


//struct ArtistsTeamView_Previews: PreviewProvider {
//    static var previews: some View {
//        ArtistsTeamView()
//    }
//}
