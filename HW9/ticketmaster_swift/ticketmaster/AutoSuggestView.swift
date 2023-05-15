//
//  AutoSuggestView.swift
//  ticketmaster
//
//  Created by SRI MANVITH VADDEBOYINA on 4/15/23.
//

import SwiftUI
import Alamofire

struct AutoSuggestView: View {
    @Binding var keyword: String
    @State var suggestions:[String]=[]
    @State var isLoading = true

    @Environment(\.presentationMode) var presentationMode
    
    var body: some View {
        VStack{
            if isLoading{
                ProgressView()
                Text("loading...")
                    .foregroundColor(.gray)
            }
            else{
                HStack{
                    Text("Suggestions")
                        .font(.title)
                        .fontWeight(.bold)
                        .padding()
                        .frame(maxWidth: .infinity)
                    Spacer()
                }
                List(suggestions,id:\.self){
                    suggestion in Text(suggestion)
                        .onTapGesture {
                            keyword = suggestion
                            presentationMode.wrappedValue.dismiss()
                        }
                }
            }
        }
        .onAppear{
            fetchSuggestions()
        }
        
    }
    
    func fetchSuggestions(){
        let parameters: [String:Any]=[
            "input_text": keyword
        ]
        AF.request("https://ticketmaster-backend.wl.r.appspot.com/api/suggest",parameters:parameters)
            .responseJSON { response in
                isLoading = false
                switch response.result {
                case .success(let value):
                    if let json = value as? [String: Any], let embedded=json["_embedded"] as? [String:
                                                                                                Any], let attractions = embedded["attractions"] as? [[String: Any]]{
                        self.suggestions = attractions.map{$0["name"] as? String ?? ""}
                    }
                case .failure(let error):
                    print(error)
                }
            }
    }
}

