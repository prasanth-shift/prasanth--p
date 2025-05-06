import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../delivery.service';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-delivery',
  templateUrl: './delivery.component.html',
  styleUrls: ['./delivery.component.css'],
  imports: [CommonModule, FormsModule],
})
export class DeliveryComponent implements OnInit {
  prasanth: number;
  searchQuery = '';
  orderIdSearch = '';
  area: number | null = null;
  status = '';
  limit: number | null = null;
  user:any=null;
  orders: any[] = [];
  agents: any[] = [];
  pincodeSuggestions: number[] = [];
  
  showPincodeDropdown = false;
  showLimitDropdown = false;
  showStatusDropdown = false;
  showAgentCard = false;
  showStatusCard = false;

  selectedOrderId: number | null = null;
  selectedOrder: any = null;


  otpForm: FormGroup;
  otpSent = false;
  otp: string = ''; // Property to store OTP

 
  statusOptions = [
    'waiting',
    'order_failed',
    'order_placed',
    'shipped',
    'out-for-delivery',
    'delivered',
    'cancellation_waiting',
    'cancelled',
    'return_requested',
    'return_request_accepted',
    'returned',
    'refund_done',
  ];

  limitOptions = [5, 10, 20, 50];

  errorMessage: string | null = null;
  isLoading = false;


  constructor(
    private fb: FormBuilder,
    private deliveryService: DeliveryService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,          // Inject HttpClient here
    private router: Router,            // Inject Router here
    private cookieService: CookieService // Inject CookieService here
  ) {
    this.otpForm = this.fb.group({
      otp: ['', Validators.required]
    });
  }

  ngOnInit() {
    console.log('DeliveryComponent initialized');
    this._loadOrders();
  }

  // Search button
  searchByQuery() {
    console.log('searchByQuery called with query:', this.searchQuery);
    this.errorMessage = null;
    this.isLoading = true;
    const q = this.searchQuery.trim();
    if (!q) {
      console.log('Empty query, resetting search');
      this.orderIdSearch = '';
      this._loadOrders();
      return;
    }
    this.orderIdSearch = q; 
    this._loadOrders();
  }
  

  // Load orders
  private _loadOrders() {
    console.log('Loading orders with params:', {
      orderIdSearch: this.orderIdSearch,
      area: this.area,
      status: this.status,
      limit: this.limit,
    });
    this.isLoading = true;
    this.errorMessage = null;
    const params: string[] = [];
    if (this.orderIdSearch) params.push(`order_id='${this.orderIdSearch}'`);
    if (this.area !== null) params.push(`area=${this.area}`);
    if (this.status) params.push(`status=${this.status}`);
    if (this.limit !== null) params.push(`limit=${this.limit}`);
    const qs = params.length ? `?${params.join('&')}` : '';
    const url = `/api/delivery/admin/order${qs}`;
    console.log(url)
    console.log('Fetching orders from URL:', url);
    this.deliveryService.getOrders(url).subscribe({
      next: (r) => {
        console.log('Orders API response:', r);
        this.orders = r.code === 1 && Array.isArray(r.data) ? r.data : [];
        this.isLoading = false;
        if (this.orders.length === 0) {
          console.log('No orders found for query');
          this.errorMessage = 'No orders found for the given ID';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Orders API error:', err);
        this.errorMessage = 'Failed to load orders. Please check the server.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Dropdown toggles
  openPincodeDropdown() {
    console.log('Pincode dropdown clicked');
    this.showPincodeDropdown = !this.showPincodeDropdown;
    this.showLimitDropdown = false;
    this.showStatusDropdown = false;
    if (this.showPincodeDropdown) this.fetchAllPincodes();
    this.cdr.detectChanges();
  }

  openLimitDropdown() {
    console.log('Limit dropdown clicked');
    this.showLimitDropdown = !this.showLimitDropdown;
    this.showPincodeDropdown = false;
    this.showStatusDropdown = false;
    this.cdr.detectChanges();
  }

  openStatusDropdown() {
    console.log('Status dropdown clicked');
    this.showStatusDropdown = !this.showStatusDropdown;
    this.showPincodeDropdown = false;
    this.showLimitDropdown = false;
    this.cdr.detectChanges();
  }

  fetchAllPincodes() {
    console.log('Fetching pincodes');
    this.isLoading = true;
    this.errorMessage = null;
    this.deliveryService.getPincodeSuggestions('/api/admin/pincode/').subscribe({
      next: (r) => {
        console.log('Pincodes response:', r);
        this.pincodeSuggestions = r.code === 1 ? r.data.map((d: any) => +d.code) : [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Pincodes error:', err);
        this.errorMessage = 'Failed to load pincodes';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selectPincode(pin: number) {
    console.log('Pincode selected:', pin);
    this.area = pin;
    this.showPincodeDropdown = false;
    this._loadOrders();
    this.cdr.detectChanges();
  }

  selectLimit(n: number) {
    console.log('Limit selected:', n);
    this.limit = n;
    this.showLimitDropdown = false;
    this._loadOrders();
    this.cdr.detectChanges();
  }

  selectStatus(s: string) {
    console.log('Status selected:', s);
    this.status = s; // Fixed typo: was INVALID_ESCAPED_KEYWORD
    this.showStatusDropdown = false;
    this._loadOrders();
    this.cdr.detectChanges();
  }

  // Assign button
  assignDelivery(order: any) {
    console.log('Assign clicked for order:', order.id);
    if (this.area === null) {
      this.errorMessage = 'Please select a pincode first';
      this.cdr.detectChanges();
      return;
    }
    this.selectedOrderId = order.id;
    this.isLoading = true;
    this.errorMessage = null;
    this.deliveryService.getAgents(`/api/delivery/admin/list/agent?area=${this.area}`).subscribe({
      next: (r) => {
        console.log('Agents response:', r);
        if (r.code === 1 && Array.isArray(r.data)) {
          this.agents = r.data;
          this.showAgentCard = true;
        } else {
          this.errorMessage = 'No agents available';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Agents error:', err);
        this.errorMessage = 'Failed to load agents';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  confirmAssignment(agent: any) {
    console.log('Assign agent clicked:', agent.id);
    if (!this.selectedOrderId) {
      this.errorMessage = 'Select an order first';
      this.cdr.detectChanges();
      return;
    }
    this.isLoading = true;
    this.errorMessage = null;
    this.deliveryService
      .assignAgent({ order_id: this.selectedOrderId, agent_id: agent.id })
      .subscribe({
        next: (r) => {
          console.log('Assign agent response:', r);
          if (r.code === 1) {
            alert('Agent assigned successfully');
            this.showAgentCard = false;
            this._loadOrders();
          } else {
            this.errorMessage = r.message || 'Failed to assign agent';
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Assign agent error:', err);
          this.errorMessage = 'Failed to assign agent';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // Update button
  openUpdateStatus(order: any) { 
    console.log('Update clicked for order:', order.id);
    console.log("user id ",":",order)
    this.selectedOrder = { id: order.id, status: order.order_status,uid: order.uid ,delivery:order.delivery_address};
  //  this.prasanth = order.uid;
   this.fetchItems();
    this.showStatusCard = true;
    this.cdr.detectChanges();
  }

  updateOrderStatus() {
    
    console.log('Update status submitted:', this.selectedOrder);
    this.isLoading = true;
    this.errorMessage = null;
    this.deliveryService.updateOrderStatus(this.selectedOrder).subscribe({
      next: (r) => {
        console.log('Update status response:', r);
        if (r.code === 1) {
          alert('Status updated successfully');
          this.showStatusCard = false;
          this._loadOrders();
        } else {
          this.errorMessage = r.message || 'Failed to update status';
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('Update status error:', err);
        this.errorMessage = 'Failed to update status';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // TrackBy functions
  trackByOrderId(index: number, order: any): number {
    return order.id;
  }

  trackByAgentId(index: number, agent: any): number {
    return agent.id;
  }
  fetchItems() {
    console.log(this.prasanth);
    this.deliveryService.getUser(this.selectedOrder.uid).subscribe(
      (response) => {
        console.log('Items fetched:', response);

        this.user = response.data;
        console.log(this.user);
      },
      (error) => {
        console.error('Error fetching items:', error);
        alert('Failed to load items.');
      }
    );
  }
  
}


