import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ItemsService } from '../items.service';
import { Router } from '@angular/router';
import { SubitemsService } from '../subitems.service';

@Component({
  selector: 'app-items',
  standalone: false,
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  itemForm: FormGroup;
  subItemForm: FormGroup;
  pincodeForm: FormGroup;
  pincodes: string[] = [];
  filteredPincodes: string[] = [];
  selectedPincodes: Set<string> = new Set();
  showSuggestions: boolean = false;
  searchText: string = '';

  items: any[] = [];
  suppliers: any[] = [];
  showConfirmationCard: boolean = false;
  showEditSubItemCard: boolean = false;
  showEditSubItemDetailsCard: boolean = false;
  showAddPincodeCard: boolean = false;
  showRemovePincodeCard: boolean = false;
  subItems: any[] = [];
  selectedItemId: number | null = null;
  selectedSubItem: any = null;
  isSubItemModalOpen = false;
  subItemData = {
    item_id: null,
    quantity: null,
    price: null,
    units: null,
    discount: null
  };

  constructor(
    private formBuilder: FormBuilder,
    private itemsService: ItemsService,
    private router: Router,
    private subitemsService: SubitemsService
  ) {
    this.itemForm = this.formBuilder.group({
      name: [''],
      description: [''],
      category: [''],
      brandId: [''],
      images: [''],
      isOrganic: [],
      supplierId: ['']
    });
    this.subItemForm = this.formBuilder.group({
      quantity: [null, Validators.required],
      price: [null, Validators.required],
      discount: [null],
      units: [null, Validators.required]
    });
    this.pincodeForm = this.formBuilder.group({
      itemId: [{ value: null, disabled: true }, Validators.required],
      pincode: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log('ItemsComponent initialized');
    this.itemsService.getSuppliers().subscribe(
      (response) => {
        console.log('Suppliers fetched:', response);
        this.suppliers = response.data || [];
      },
      (error) => {
        console.error('Error fetching suppliers:', error);
        alert('Failed to load suppliers: ' + (error.error?.message || 'Server error'));
      }
    );
    this.fetchItems();
    this.fetchPincodes();
  }

  fetchItems() {
    this.itemsService.getItems().subscribe(
      (response) => {
        console.log('Items fetched:', response);
        this.items = response.data || [];
        console.log('Items array:', this.items);
        if (this.items.length === 0) {
          console.warn('No items found in response');
          alert('No items available. Please add items to see the table.');
        } else {
          console.log('Items loaded successfully, table should render');
        }
      },
      (error) => {
        console.error('Error fetching items:', error);
        alert('Failed to load items: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  deleteItem(item_id: number): void {
    if (!confirm('Are you sure you want to delete this item? This will also delete all associated sub-items.')) {
      return;
    }
    if (isNaN(item_id)) {
      alert('Invalid item ID.');
      return;
    }
    console.log('Attempting to delete item ID:', item_id);
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No authentication token found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }
    this.itemsService.deleteItem(item_id).subscribe({
      next: (response) => {
        console.log('Delete response:', response);
        if (response.code === 1) {
          alert('Item deleted successfully!');
          this.items = this.items.filter(item => item.item_id !== item_id);
          console.log('Updated items array:', this.items);
        } else {
          alert(response.message || 'Failed to delete item.');
        }
      },
      error: (error) => {
        console.error('Error deleting item:', error);
        let message = 'Failed to delete item.';
        if (error.status === 401) {
          message = 'Session expired or unauthorized. Please log in again.';
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else if (error.status === 404) {
          message = 'Item not found.';
        } else {
          message = error.error?.message || 'Server error.';
        }
        alert(message);
      }
    });
  }

  onSubmit() {
    const formValue = this.itemForm.value;
    const supplierId = parseInt(formValue.supplierId, 10);
    const requestBody = {
      name: formValue.name,
      description: formValue.description,
      category: formValue.category,
      brand_id: formValue.brandId,
      images: formValue.images.split(',').map((url: string) => url.trim()),
      isorganic: formValue.isOrganic,
      supplier_id: supplierId
    };
    this.itemsService.addItem(requestBody).subscribe(
      (response) => {
        console.log('Item added successfully:', response);
        alert('Item added successfully!');
        this.items.push(response.data);
        this.itemForm.reset();
        this.itemForm.patchValue({ isOrganic: 'false' });
      },
      (error) => {
        console.error('Error adding item:', error);
        alert('Failed to add item: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  fetchPincodes() {
    this.itemsService.getPincodes().subscribe(
      (response) => {
        this.pincodes = response.data.map(p => p.code);
        this.filteredPincodes = [...this.pincodes];
      },
      (error) => {
        console.error('Error fetching pincodes:', error);
      }
    );
  }

  openAddPincodeCard(itemId: number) {
    this.selectedItemId = itemId;
    this.showAddPincodeCard = true;
    this.pincodeForm.patchValue({
      itemId: itemId
    });
  }

  closeAddPincodeCard() {
    this.showAddPincodeCard = false;
    this.pincodeForm.reset();
    this.selectedPincodes.clear();
    this.showSuggestions = false;
  }

  filterPincodes() {
    if (!this.searchText || !this.searchText.trim()) {
      this.filteredPincodes = [...this.pincodes];
      return;
    }
    this.filteredPincodes = this.pincodes.filter((pincode) =>
      pincode.toString().includes(this.searchText.trim())
    );
  }

  togglePincodeSelection(pincode: string) {
    if (this.selectedPincodes.has(pincode)) {
      this.selectedPincodes.delete(pincode);
    } else {
      this.selectedPincodes.add(pincode);
    }
    this.pincodeForm.patchValue({ pincode: Array.from(this.selectedPincodes).join(', ') });
  }

  onPincodeFocus() {
    this.showSuggestions = true;
  }

  onPincodeBlur() {
    setTimeout(() => {
      this.showSuggestions = false;
    }, 200);
  }

  onAddPincode() {
    if (this.selectedPincodes.size === 0) {
      alert('Please select at least one pincode.');
      return;
    }
    const requestBody = {
      item_id: this.selectedItemId,
      pincode: Array.from(this.selectedPincodes).map(p => Number(p))
    };
    this.itemsService.addPincode(requestBody).subscribe(
      () => {
        alert('Pincode(s) added successfully!');
        this.closeAddPincodeCard();
      },
      (error) => {
        console.error('Error adding pincode:', error);
        alert('Failed to add pincode: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  openRemovePincodeCard(itemId: number) {
    this.selectedItemId = itemId;
    this.showRemovePincodeCard = true;
    this.pincodeForm.patchValue({
      itemId: itemId
    });
  }

  closeRemovePincodeCard() {
    this.showRemovePincodeCard = false;
    this.pincodeForm.reset();
  }

  onRemovePincode() {
    if (this.pincodeForm.invalid) {
      alert('Please fill in all the required fields.');
      return;
    }
    const pincode = this.pincodeForm.value.pincode;
    const itemId = this.selectedItemId;
    if (!itemId || isNaN(itemId)) {
      alert('Invalid Item ID.');
      return;
    }
    const pincodeNumber = Number(pincode);
    if (isNaN(pincodeNumber)) {
      alert('Invalid pincode format.');
      return;
    }
    const requestBody = {
      item_id: itemId,
      pincode: pincodeNumber
    };
    this.itemsService.removePincode(requestBody).subscribe(
      (response) => {
        alert('Pincode removed successfully!');
        this.closeRemovePincodeCard();
      },
      (error) => {
        console.error('Error removing pincode:', error);
        alert('Failed to remove pincode: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  showConfirmation(item_id: number) {
    this.selectedItemId = item_id;
    this.showConfirmationCard = true;
  }

  closeConfirmationCard() {
    this.showConfirmationCard = false;
  }

  openSubItemModal() {
    this.showConfirmationCard = false;
    this.isSubItemModalOpen = true;
    this.subItemData.item_id = this.selectedItemId;
  }

  closeSubItemModal() {
    this.isSubItemModalOpen = false;
  }

  openEditSubItemCard(itemId: number) {
    this.selectedItemId = itemId;
    this.showEditSubItemCard = true;
    this.itemsService.getSubItemDetails(itemId).subscribe(
      (response) => {
        console.log('Sub-Items fetched:', response);
        this.subItems = response.data || [];
      },
      (error) => {
        console.error('Error fetching sub-items:', error);
        alert('Failed to fetch sub-items: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  closeEditSubItemCard() {
    this.showEditSubItemCard = false;
    this.subItems = [];
  }

  openEditSubItemDetails(subItem: any) {
    this.selectedSubItem = subItem;
    this.showEditSubItemDetailsCard = true;
    this.subItemForm.patchValue({
      quantity: subItem.quantity,
      price: subItem.price,
      discount: subItem.discount,
      units: subItem.units
    });
  }

  closeEditSubItemDetailsCard() {
    this.showEditSubItemDetailsCard = false;
    this.subItemForm.reset();
  }

  onUpdateSubItem() {
    if (this.subItemForm.invalid) {
      alert('Please fill in all the required fields.');
      return;
    }
    const updatedSubItem = {
      iqu_id: this.selectedSubItem.iqu_id,
      item_id: this.selectedItemId,
      quantity: this.subItemForm.value.quantity,
      price: this.subItemForm.value.price,
      units: this.subItemForm.value.units,
      discount: this.subItemForm.value.discount
    };
    this.itemsService.updateSubItem(updatedSubItem).subscribe(
      (response) => {
        console.log('Sub-item updated successfully:', response);
        alert('Sub-item updated successfully!');
        this.closeEditSubItemDetailsCard();
        this.fetchItems();
      },
      (error) => {
        console.error('Error updating sub-item:', error);
        alert('Failed to update sub-item: ' + (error.error?.message || 'Server error'));
      }
    );
  }

  onSubmitSubItem(subItemForm: NgForm) {
    console.log('Submitting sub-item:', this.subItemData);
    this.subitemsService.addSubItem(this.subItemData).subscribe(
      (response) => {
        console.log('Sub-item added successfully:', response);
        alert('Sub-item added successfully!');
        subItemForm.resetForm();
        this.isSubItemModalOpen = false;
      },
      (error) => {
        console.error('Error adding sub-item:', error);
        alert('Failed to add sub-item: ' + (error.error?.message || 'Server error'));
      }
    );
  }
}