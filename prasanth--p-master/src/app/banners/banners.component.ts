import { Component, OnInit } from '@angular/core';
import { BannerService } from '../banner.service';

@Component({
  selector: 'app-banners',
  standalone: false,
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.css']
})
export class BannersComponent implements OnInit {
  bannerUrl: string = '';
  bannerStatus: string = 'active';  // We'll convert this to isactive (1 or 0) for backend
  banners: any[] = [];
  editingId: number | null = null;  // banner_id seems to be a number, not string

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.getAllBanners();
  }

  getAllBanners(): void {
    console.log('Calling getAllBanners...');
    this.bannerService.getAllBanners().subscribe(
      (response) => {
        this.banners = response.data;
        console.log('Banners:', this.banners);
      },
      (error) => {
        console.error('Error fetching banners:', error);
      }
    );
  }

saveBanner(): void {
  const isactive = this.bannerStatus === 'active';

  const payload: any = {
    title: 'Welcome Banner',        // Make dynamic if needed
    banner_image: this.bannerUrl,
    isactive: isactive,
    link: 'https://example.com'     // Important: must not be empty
  };

  if (this.editingId !== null) {
    payload.banner_id = this.editingId;
  }

  console.log('Saving banner payload:', payload);

  const request$ = this.editingId !== null
    ? this.bannerService.updateBanner(payload)
    : this.bannerService.addBanner(payload);

  request$.subscribe(
    () => {
      this.resetForm();
      this.getAllBanners();
    },
    (error) => {
      console.error('Error saving banner:', error);
    }
  );
}


  deleteBanner(id: string): void {
    if (!id) {
      console.error('Invalid banner id for delete:', id);
      return;
    }
    if (!confirm('Are you sure you want to delete this banner?')) return;

    this.bannerService.deleteBanner(id).subscribe(
      () => this.getAllBanners(),
      (error) => console.error('Error deleting banner:', error)
    );
  }

  editBanner(banner: any): void {
    this.editingId = banner.banner_id; 
    this.bannerUrl = banner.banner_image;
    this.bannerStatus = banner.isactive === 1 ? 'active' : 'inactive';
  }

  resetForm(): void {
    this.bannerUrl = '';
    this.bannerStatus = 'active';
    this.editingId = null;
  }
}
