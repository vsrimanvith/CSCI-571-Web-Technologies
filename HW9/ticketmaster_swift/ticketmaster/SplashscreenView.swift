//
//  SplashscreenView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/15/23.
//

import SwiftUI

struct SplashscreenView: View {
    @State private var isActive = false
    @State private var size = 0.8
    
    var body: some View {
        if isActive{
            ContentView()
        }
        else
        {
            VStack{
                VStack{
                    Image("launchScreen")
                        .font(.system(size:80))
                }
                .scaleEffect(size)
            }
            .onAppear{
                DispatchQueue.main.asyncAfter(deadline: .now()+1){
                    self.isActive = true
                }
            }
        }
    }
}

struct SplashscreenView_Previews: PreviewProvider {
    static var previews: some View {
        SplashscreenView()
    }
}
