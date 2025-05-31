import { Component, OnInit } from '@angular/core';
import { BrandsService } from '../brands.service';

@Component({
  selector: 'app-brands',
  standalone: false,
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.css'] // ✅ FIXED typo from styleUrl
})
export class BrandsComponent implements OnInit {
  brand = {
    name: '',
    images: '',
  };

  brands: any[] = [];

  constructor(private brandsService: BrandsService) {}

  ngOnInit(): void {
    this.getAllBrands();
  }

  onSubmit() {
    const requestBody = {
      name: this.brand.name,
      images: this.brand.images.split(',').map((url) => url.trim()),
    };

    this.brandsService.addBrand(requestBody).subscribe(
      (response) => {
        console.log('Brand added successfully:', response);
        alert('Brand added successfully!');
        this.getAllBrands(); // Refresh list
        this.brand = { name: '', images: '' }; // Clear form
      },
      (error) => {
        console.error('Error adding brand:', error);
        alert('Failed to add brand. Please try again.');
      }
    );
  }

getAllBrands() {
  this.brandsService.getBrands().subscribe(
    (response: any) => {
      const brandArray = response.data || [];
      this.brands = brandArray.map((b: any) => ({
        ...b,
        images: Array.isArray(b.images)
          ? b.images
          : (b.images || '').split(',').map((url: string) => url.trim()),
      }));

      console.log(this.brands); // <-- check here for the ID field name
    },
    (error) => {
      console.error('Error fetching brands:', error);
    }
  );
}



  editBrand(brand: any) {
    this.brand.name = brand.name;
    this.brand.images = Array.isArray(brand.images)
      ? brand.images.join(', ')
      : brand.images;
  }

  deleteBrand(id: number) {
  if (!id) {
    alert('Brand ID is missing!');
    return;
  }
  if (!confirm('Are you sure you want to delete this brand?')) {
    return;
  }

  this.brandsService.deleteBrand(id).subscribe(
    () => {
      alert('Brand deleted successfully!');
      this.getAllBrands();  // refresh list after delete
    },
    (error) => {
      console.error('Error deleting brand:', error);
      alert('Failed to delete brand.');
    }
  );
}

}
