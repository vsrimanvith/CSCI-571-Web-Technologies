//
//  ArtistView.swift
//  EventFinder
//
//  Created by rishi nareddy on 12/04/23.
//

import SwiftUI

struct ArtistView: View {
    var body: some View {
        ZStack{
            ScrollView{
                VStack{
                    ForEach(0..<4) {index in
                        VStack{
                            HStack{
                                AsyncImage(url: URL(string: "https://s1.ticketm.net/dam/a/7d5/97b67038-f926-4676-be88-ebf94cb5c7d5_1802151_TABLET_LANDSCAPE_3_2.jpg")) { image in
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 100, height: 100)
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 100, height: 100)
                                
                                VStack{
                                    Text("Ed Sheeran")
                                        .multilineTextAlignment(.leading)
                                    Text("110M Followers")
                                    Text("Spotify")
                                }
                                VStack{
                                    Text("Popularity")
                                    ProgressView(value: 0.9)
                                        .progressViewStyle(RingProgressViewStyle(progressColor: .red))
                                    
                                }
                            }
                            HStack{
                                Text("Popular Albums")
                                Spacer()
                            }
                            HStack{
                                AsyncImage(url: URL(string: "https://s1.ticketm.net/dam/a/7d5/97b67038-f926-4676-be88-ebf94cb5c7d5_1802151_TABLET_LANDSCAPE_3_2.jpg")) { image in
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 100, height: 100)
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 100, height: 100)
                                
                                AsyncImage(url: URL(string: "https://s1.ticketm.net/dam/a/7d5/97b67038-f926-4676-be88-ebf94cb5c7d5_1802151_TABLET_LANDSCAPE_3_2.jpg")) { image in
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 100, height: 100)
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 100, height: 100)
                                
                                AsyncImage(url: URL(string: "https://s1.ticketm.net/dam/a/7d5/97b67038-f926-4676-be88-ebf94cb5c7d5_1802151_TABLET_LANDSCAPE_3_2.jpg")) { image in
                                    image.resizable()
                                        .aspectRatio(contentMode: .fit)
                                        .frame(width: 100, height: 100)
                                        .cornerRadius(10)
                                } placeholder: {
                                    ProgressView()
                                }
                                .frame(width: 100, height: 100)
                            }
                            Spacer()
                        }
                        //            Rectangle()
                        //                .fill(Color.gray)
                        //            .padding() // Add some padding to make the background visible
                        .background(Color.gray)
                        Spacer()
                            .cornerRadius(10)
                        //                .padding(.horizontal, 20)
                    }
                }
//                .padding()
                //        Spacer()
            }
            .padding()
        }
    }
}

struct RingProgressViewStyle: ProgressViewStyle {
    var progressColor: Color
    
    
    func makeBody(configuration: Configuration) -> some View {
        ZStack {
            Circle()
                .stroke(lineWidth: 15)
                .opacity(0.3)
                .foregroundColor(Color.orange)
                .frame(width: 50, height: 50)
            
            Circle()
                .trim(from: 0.0, to: CGFloat(configuration.fractionCompleted ?? 0))
                .stroke(style: StrokeStyle(lineWidth: 15, lineCap: .round, lineJoin: .round))
                .foregroundColor(Color.orange)
                .rotationEffect(Angle(degrees: 1.0))
                .animation(.linear)
                .frame(width: 50, height: 50)
        }
    }
}

struct ArtistView_Previews: PreviewProvider {
    static var previews: some View {
        ArtistView()
    }
}
