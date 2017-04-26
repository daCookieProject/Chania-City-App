import { Component } from '@angular/core';
import { NavController,NavParams} from 'ionic-angular';
import {GoogleMap, GoogleMapsEvent, LatLng,MarkerOptions,Marker} from '@ionic-native/google-maps';
import { Data } from '../../providers/data';
import 'rxjs/add/operator/map';


@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})



export class AboutPage {
	myMarker:Marker;
	testMarker:Marker;
	gmap:GoogleMap;
	element:HTMLElement;
	listOrMap:string;
	items:  Array<Object>;
	selectedItem: any;

	
	constructor(public navCtrl: NavController,public navParams: NavParams,public dataService: Data) {
		this.listOrMap = "list";
		this.selectedItem = navParams.get('item');
	}

	// Load map only after view is initialized
/* 	ngAfterViewInit() {

		this.segmentChanger();
	} */
	
	
	////////////   onSegmentChange($event)    /////////////////////////////////////////////
	onSegmentChange(event){
		setTimeout(()=>{ 
			this.element = document.getElementById('map');		
			console.log("--- delay 1 ---");
			if (event.value == "map"){
				this.loadMap();
			}	
		}, 1);
	}
	

/////////////////////////////////     loadMap()             ///////////////////////////////////////////////
	
	
	loadMap() {

		//this.element = document.getElementById('map');		

		setTimeout(()=>{ 
			console.log("--- delay 2 ---");	
			this.gmap = new GoogleMap(this.element);	

			setTimeout(()=>{ 			
				console.log("--- delay 3 ---");
				 // move the map's camera to position
				this.gmap.animateCamera({
				  'target': this.dataService.myLocation,
				  'tilt': 30,
				  'zoom': 18,
				  'bearing': 140
				});
				
				for(let kota = 0; kota < this.dataService.clients.length; kota++){
					let testMarkerOptions: MarkerOptions = {
						position: new LatLng(this.dataService.clients[kota].latitude,this.dataService.clients[kota].longtitude),
						title: this.dataService.clients[kota].name
					};
					
					this.gmap.addMarker(testMarkerOptions).then((marker)=>{
						this.testMarker = marker;
						this.testMarker.showInfoWindow();
					});				
				}
				
				let myMarkerOptions: MarkerOptions = {
					position: this.dataService.myLocation,
					title: 'You are here!'
				};
				
				this.gmap.addMarker(myMarkerOptions).then((marker)=>{
					this.myMarker = marker;
					this.myMarker.showInfoWindow();
				}).then(()=>{this.afterMapLoad();});

			}, 1000);
		}, 1);
	}



///////////////////////////////////////   geObserve()         /////////////////////////////////////////////////	
	afterMapLoad(){
		this.dataService.watch.subscribe(() => {
			//alert("In observable");
			 // move the map's camera to position
 			this.gmap.animateCamera({
			  'target': this.dataService.myLocation,
			  'tilt': 30,
			  'zoom': 18,
			  'bearing': 140
			});
		
			this.myMarker.setPosition(this.dataService.myLocation);
			//this.myMarker.showInfoWindow(); 
		});		
	}
	

	itemTapped(event, item) {
   // That's right, we're pushing to ourselves!
		this.navCtrl.parent.select(2);	
	}
	



////////////////// DANGER ZONE ////////////////////////////////

		
		

	

	
	
}