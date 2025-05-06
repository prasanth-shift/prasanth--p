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
  ItemEditForm: FormGroup;
  itemId: number | null = null;
  item: any = {};
  itemToEdit: any = {};
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
  showEditItemCard: boolean = false;
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
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      brandId: ['', Validators.required],
      isOrganic: ['', Validators.required],
      supplierId: ['', Validators.required]
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

    this.ItemEditForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required],
      brandId: ['', Validators.required],
      isOrganic: ['', Validators.required],
      supplierId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.itemsService.getSuppliers().subscribe(
      (response) => {
        console.log('Suppliers fetched:', response);
        this.suppliers = response.data;
      },
      (error) => {
        console.error('Error fetching suppliers:', error);
        alert('Failed to load suppliers.');
      }
    );
    this.fetchItems();
    this.fetchPincodes();
  }

  fetchItems() {
    this.itemsService.getItems().subscribe(
      (response) => {
        console.log('Items fetched:', response);
        this.items = response.data;
      },
      (error) => {
        console.error('Error fetching items:', error);
        alert('Failed to load items.');
      }
    );
  }

  fetchPincodes() {
    this.itemsService.getPincodes().subscribe(
      (response) => {
        this.pincodes = response.data.map(p => p.code);
        this.filteredPincodes = [...this.pincodes]; // Initialize filtered list
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
  }
  filterPincodes(searchText: string) {
     console.log("Search Text:", this.searchText);

  if (!this.searchText || !this.searchText.trim()) {
    this.filteredPincodes = [...this.pincodes]; // Reset filter
    return;
  }

  this.filteredPincodes = this.pincodes.filter((pincode) =>
    pincode.toString().includes(this.searchText.trim())
  );

  console.log("Filtered Pincodes:", this.filteredPincodes);
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
  this.showSuggestions = !this.showSuggestions;
}

  // onPincodeBlur() {
  //   setTimeout(() => {
  //     this.showSuggestions = false;
  //   }, 200);
  // }

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
        alert('Failed to add pincode.');
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
      alert('Invalid Item ID. Please enter a valid Item ID.');
      return;
    }

    const pincodeNumber = Number(pincode);

    if (isNaN(pincodeNumber)) {
      alert('Invalid pincode format. Please enter a valid pincode.');
      return;
    }

    const requestBody = {
      item_id: this.selectedItemId,
      pincode: pincodeNumber
    };

    this.itemsService.removePincode(requestBody).subscribe(
      () => {
        alert('Pincode removed successfully!');
        this.closeRemovePincodeCard();
      },
      (error) => {
        console.error('Error removing pincode:', error);
        alert('Failed to remove pincode. Please try again.');
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
  }

  closeSubItemModal() {
    this.isSubItemModalOpen = false;
  }

  navigateToAddSubItems() {
    this.showConfirmationCard = false;
    this.router.navigate(['/addsubitems']);
  }

  openEditSubItemCard(itemId: number) {
    this.selectedItemId = itemId;
    this.showEditSubItemCard = true;
    this.itemsService.getSubItemDetails(itemId).subscribe(
      (response) => {
        console.log('Sub-Items fetched:', response);
        this.subItems = response.data;
      },
      (error) => {
        console.error('Error fetching sub-items:', error);
        alert('Failed to fetch sub-items.');
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
      () => {
        alert('Sub-item updated successfully!');
        this.closeEditSubItemDetailsCard();
        this.fetchItems();
      },
      (error) => {
        console.error('Error updating sub-item:', error);
        alert('Failed to update sub-item. Please try again.');
      }
    );
  }

  onSubmitSubItem(subItemForm: NgForm) {
    this.subitemsService.addSubItem(this.subItemData).subscribe(
      () => {
        alert('Sub-item added successfully!');
        subItemForm.resetForm();
        this.isSubItemModalOpen = false;
      },
      (error) => {
        console.error('Error adding sub-item:', error);
        alert('Failed to add sub-item. Please try again.');
      }
    );
  }

  fetchItemToEdit(itemId: number) {
    this.itemsService.getItem(itemId).subscribe(
      (response) => {
        console.log('Item fetched:', response);
        this.itemToEdit = response.data[0] || {};
        this.ItemEditForm.patchValue({
          name: this.itemToEdit.item_name || '',
          description: this.itemToEdit.description || '',
          category: this.itemToEdit.category || '',
          brandId: this.itemToEdit.brand_id || '',
          isOrganic: this.itemToEdit.isorganic != null ? this.itemToEdit.isorganic.toString() : 'false',
          supplierId: this.itemToEdit.supplier_id || ''
        });
        console.log('Form patched with:', this.ItemEditForm.value);
      },
      (error) => {
        console.error('Error fetching item details:', error);
        alert('Failed to load item details. You can still edit the form.');
        this.itemToEdit = {};
        this.ItemEditForm.reset();
      }
    );
  }

  openEditItemCard(itemId: number) {
    console.log('Opening Edit Item Card for itemId:', itemId);
    if (!itemId || isNaN(itemId)) {
      console.error('Invalid itemId:', itemId);
      alert('Invalid item ID. Please try again.');
      return;
    }
    this.selectedItemId = itemId;
    this.showEditItemCard = true;
    this.fetchItemToEdit(itemId);
    console.log('showEditItemCard set to:', this.showEditItemCard);
  }

  closeEditItemCard() {
    console.log('Closing Edit Item Card');
    this.showEditItemCard = false;
    this.ItemEditForm.reset();
    this.selectedItemId = null;
  }

  onUpdateItem() {
    if (this.ItemEditForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const formValue = this.ItemEditForm.value;
    const brandId = parseInt(formValue.brandId, 10);
    const supplierId = parseInt(formValue.supplierId, 10);

    if (isNaN(brandId) || brandId <= 0) {
      alert('Invalid Brand ID. Please select a valid brand.');
      return;
    }

    if (isNaN(supplierId) || supplierId <= 0) {
      alert('Invalid Supplier ID. Please select a valid supplier.');
      return;
    }

    if (!this.suppliers.some(s => s.sid === supplierId)) {
      alert('Selected Supplier ID does not exist.');
      return;
    }

    if (!this.selectedItemId) {
      alert('Invalid Item ID.');
      return;
    }

    const updatedItem = {
      item_id: this.selectedItemId,
      item_name: formValue.name.trim(),
      description: formValue.description.trim(),
      category: formValue.category.trim(),
      brand_id: brandId,
      isorganic: formValue.isOrganic === 'true' ? 1 : 0,
      supplier_id: supplierId
    };

    console.log('Form values:', formValue);
    console.log('Sending update payload:', updatedItem);

    this.itemsService.updateItem(updatedItem).subscribe(
      () => {
        alert('Item updated successfully!');
        this.showEditItemCard = false;
        this.fetchItems();
        this.router.navigate(['/items']);
      },
      (error) => {
        console.error('Error updating item:', error);
        const errorMessage = error.error?.message || 'Invalid data. Please check the form (e.g., Category, Brand ID, Supplier ID) and try again.';
        alert(`Failed to update item: ${errorMessage}`);
      }
    );
  }

  onSubmit() {
    if (this.itemForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const formValue = this.itemForm.value;
    const brandId = parseInt(formValue.brandId, 10);
    const supplierId = parseInt(formValue.supplierId, 10);

    if (isNaN(brandId) || brandId <= 0) {
      alert('Invalid Brand ID. Please select a valid brand.');
      return;
    }

    if (isNaN(supplierId) || supplierId <= 0) {
      alert('Invalid Supplier ID. Please select a valid supplier.');
      return;
    }

    if (!this.suppliers.some(s => s.sid === supplierId)) {
      alert('Selected Supplier ID does not exist.');
      return;
    }

    const requestBody = {
      item_name: formValue.name.trim(),
      description: formValue.description.trim(),
      category: formValue.category.trim(),
      brand_id: brandId,
      isorganic: formValue.isOrganic === 'true' ? 1 : 0,
      supplier_id: supplierId
    };

    console.log('Form values:', formValue);
    console.log('Sending add item payload:', requestBody);

    this.itemsService.addItem(requestBody).subscribe(
      () => {
        alert('Item added successfully!');
        this.itemForm.reset();
        this.itemForm.patchValue({ isOrganic: 'false' });
        this.fetchItems();
      },
      (error) => {
        console.error('Error adding item:', error);
        const errorMessage = error.error?.message || 'Invalid data. Please check the form and try again.';
        alert(`Failed to add item: ${errorMessage}`);
      }
    );
  }


  deleteItem(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }
  
    this.itemsService.deleteItem(id).subscribe(
      () => {
        alert('Item deleted successfully!');
        this.fetchItems(); // Refresh the list after deletion
      },
      (error) => {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    );
  }
  
}