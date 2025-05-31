import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ItemsService } from '../items.service';

@Component({
  selector: 'app-pincodes',
  standalone: false,
  templateUrl: './pincodes.component.html',
  styleUrls: ['./pincodes.component.css'] // Fixed: should be 'styleUrls'
})
export class PincodesComponent {

  constructor(
    private formBuilder: FormBuilder,
    private itemsService: ItemsService,
    private router: Router,
  ) {} // Fixed: closed constructor properly

  pincodeInput = '';

  adddPincode() {
    const input = this.pincodeInput.trim();
    if (!input) return;

    const pincodesArray = input
      .split(/[\s,]+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    if (pincodesArray.length === 0) {
      alert('Please enter at least one valid pincode.');
      return;
    }

    this.itemsService.adddPincode({ pincode: pincodesArray }).subscribe({
      next: (res) => {
        console.log('Pincodes added:', res);
        this.pincodeInput = '';
        alert('Pincodes added successfully!');
      },
      error: (err) => {
        console.error('Error adding pincodes:', err);
        alert('Failed to add pincodes.');
      },
    });
  }


   pincodes: string[] = [];          // declare and initialize as empty string array
  filteredPincodes: string[] = [];  // used for filtered display/search



  ngOnInit(): void {
    this.fetchPincodes();  // call this when component loads
  }

  fetchPincodes(): void {
    this.itemsService.getPincodes().subscribe(
      res => {
        this.pincodes = res.data.map(p => p.code);   // assumes each p has a 'code' property
        this.filteredPincodes = [...this.pincodes];  // make a copy for filtering
      },
      err => console.error('Error fetching pincodes:', err)
    );
  }


  deletePincode(pincode: number): void {

    this.itemsService.deletePincode(pincode).subscribe(
      () => {
        alert('Pincode removed successfully!');
        this.fetchPincodes();
      },
      (error) => {
        console.error('Error removing pincode:', error);
        alert('Failed to remove pincode. Please try again.');
      }
    );
}
}


