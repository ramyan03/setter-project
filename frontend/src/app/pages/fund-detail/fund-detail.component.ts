import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FundsService, Fund } from '../../services/funds.service';

// standalone: true — no NgModule needed
// CommonModule — provides *ngIf and *ngFor used in the template
// No FormsModule needed — this is a read-only view, no form inputs
@Component({
  selector: 'app-fund-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fund-detail.component.html',
  styleUrl: './fund-detail.component.scss',
})
export class FundDetailComponent implements OnInit {
  fund?: Fund;    // undefined until API response arrives
  index!: number; // set in ngOnInit before any use
  loading = true;

  // ActivatedRoute — reads URL parameters like :index
  // Router — navigates programmatically between routes
  // FundsService — makes the API call to get a single fund
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService,
  ) {}

  // Lifecycle hook — runs once after Angular fully initializes the component
  ngOnInit() {
    // Read :index from the URL — always returns a string, Number() converts it
    // /funds/3/detail → route.snapshot.paramMap.get('index') → "3" → Number("3") → 3
    this.index = Number(this.route.snapshot.paramMap.get('index'));

    this.fundsService.getOne(this.index).subscribe({
      next: (data) => {
        this.fund = data; // fund data arrives — template re-renders via *ngIf
        this.loading = false;
      },
      // Stop spinner on error so user is not stuck on a loading state
      error: () => (this.loading = false),
    });
  }

  // Formats raw fund size into readable string
  // 4867.88 → "4.87B"   798.71 → "798.71M"
  // Used in the template to display fund size in hero section
  formatSize(size: number): string {
    if (size >= 1000) return (size / 1000).toFixed(2) + 'B';
    return size.toFixed(2) + 'M';
  }

  // Navigate back to the admin table
  goBack() {
    this.router.navigate(['/funds']);
  }

  // Navigate to the edit view for this fund
  goToEdit() {
    this.router.navigate(['/funds', this.index, 'edit']);
  }

  // Generates initials from a manager name for the avatar circle
  // "Lewis Hamilton" → "LH"   "Silver Rock" → "SR"
  // Used in the template: {{ getInitials(m) }}
  // Cannot do this logic inline in the template — Angular templates do not support
  // TypeScript syntax like arrow functions with typed parameters
  getInitials(name: string): string {
    return name
      .split(' ')      // ["Lewis", "Hamilton"]
      .map((w) => w[0]) // ["L", "H"]
      .join('')          // "LH"
      .slice(0, 2)       // take max 2 characters
      .toUpperCase();    // ensure uppercase
  }
}