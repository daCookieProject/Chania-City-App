import { Component } from '@angular/core';
import { Data } from '../../providers/data';
import { NavController } from 'ionic-angular';
import { FormControl } from '@angular/forms';
import 'rxjs/add/operator/debounceTime';
	
	
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
	
    searchTerm: string = '';
	searchControl: FormControl;
    items:  Array<Object>;
    searching: any = false;
    suggestOrNot: any = true;
	
    constructor(public navCtrl: NavController, public dataService: Data) {
		this.searchControl = new FormControl();
    }

    ionViewDidLoad() {
        //Wait for more input-Avoid spam call
        this.searchControl.valueChanges.debounceTime(900)
        .subscribe(search => {
            this.searching = false;
            this.setFilteredItems();
        });
    } 

	male(){
			let query="SELECT * FROM Clients ";
			this.dataService.queryListExecuter(query).then(()=>{
            console.log("this.items.length:"+ this.dataService.items.length);
            console.log("this.clients.length:"+ this.dataService.clients.length);
			this.navCtrl.parent.select(1);
        });
    }
    
    female(){
			let query="SELECT * FROM Clients WHERE favourite";
			this.dataService.queryListExecuter(query).then(()=>{
			console.log("this.items.length:"+ this.dataService.items.length);
            console.log("this.clients.length:"+ this.dataService.clients.length);
            this.navCtrl.parent.select(1);
        });
    }

	
    onSearchInput(){
        this.searching = true;
        this.suggestOrNot = true;
    }
	
	setFilteredItems() {
       if (this.searchTerm == '' || this.suggestOrNot == false){
           this.items = null;
           this.searching = false;
       }else{
           this.items = this.dataService.filterItems(this.searchTerm);
       }
    }
	
    //on click from suggestions
    itemSelected(item){
        console.log("Item clicked! \n item id: "+item.id);
        this.suggestOrNot = false;
    }	
	
}
