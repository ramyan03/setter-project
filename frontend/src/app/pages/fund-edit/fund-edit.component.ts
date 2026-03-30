import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FundsService, Fund } from '../../services/funds.service';

// standalone: true — self-contained component, no NgModule needed
// FormsModule — required for [(ngModel)] two-way binding on the form inputs
@Component({
  selector: 'app-fund-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './fund-edit.component.html',
  styleUrl: './fund-edit.component.scss',
})
export class FundEditComponent implements OnInit {
  fund?: Fund;       // undefined until API response arrives — ? makes it optional
  index!: number;    // ! tells TypeScript this will be set before use (in ngOnInit)
  loading = true;

  // String literal union type — saveStatus can only be one of these four values
  // Template uses this to show different indicators: ⏳ Saving... ✅ Saved ❌ Error
  saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';

  // Controls whether the delete confirmation modal is visible
  showDeleteConfirm = false;

  // Array fields stored as comma-separated strings because [(ngModel)] works with strings not arrays
  // "Venture Capital, Hedge Fund" is simpler for admin to edit than a dynamic list of inputs
  // Converted back to arrays on save inside autoSave()
  strategiesStr = '';
  geographiesStr = '';
  managersStr = '';

  // Angular injects ActivatedRoute (to read URL params), Router (to navigate), and FundsService
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fundsService: FundsService,
  ) {}

  // Runs once after component is fully initialized
  ngOnInit() {
    // Read the :index param from the URL — paramMap.get() always returns a string
    // Number() converts "3" to 3 for use as array index
    this.index = Number(this.route.snapshot.paramMap.get('index'));

    this.fundsService.getOne(this.index).subscribe({
      next: (data) => {
        this.fund = data;

        // Convert arrays to comma-separated strings for the text inputs
        // ["Venture Capital", "Hedge Fund"] → "Venture Capital, Hedge Fund"
        this.strategiesStr = data.strategies.join(', ');
        this.geographiesStr = data.geographies.join(', ');
        this.managersStr = data.managers.join(', ');
        this.loading = false;
      },
    });
  }

  // Called on every input's (blur) event — fires when admin clicks away or tabs out of a field
  // Why blur and not input? input fires on every keystroke — typing a 15-char name = 15 API calls
  // blur fires once at the natural pause point when the user finishes editing
  autoSave() {
    // Guard clause — if fund is undefined (still loading), exit immediately
    if (!this.fund) return;

    // Show saving indicator in template before the async call starts
    this.saveStatus = 'saving';

    // Build the payload to send to the backend
    const payload = {
      // Spread current fund data as the base — preserves all existing fields
      ...this.fund,

      // Convert comma-separated strings back to clean arrays
      // .split(',') — "Venture Capital, Hedge Fund" → ["Venture Capital", " Hedge Fund"]
      // .map(s => s.trim()) — removes whitespace: [" Hedge Fund"] → ["Hedge Fund"]
      // .filter(Boolean) — removes empty strings from trailing commas like "Venture Capital,"
      strategies: this.strategiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      geographies: this.geographiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      managers: this.managersStr.split(',').map((s) => s.trim()).filter(Boolean),
    };

    this.fundsService.update(this.index, payload).subscribe({
      next: () => {
        this.saveStatus = 'saved';
        // Reset indicator back to idle after 2 seconds so it does not stay green forever
        setTimeout(() => (this.saveStatus = 'idle'), 2000);
      },
      error: () => (this.saveStatus = 'error'),
    });
  }

  // Two-step delete — shows confirmation modal first before actually deleting
  // Why two steps? Deletes are irreversible — JSON file has no trash or undo
  confirmDelete() {
    this.showDeleteConfirm = true; // template *ngIf shows the modal
  }

  cancelDelete() {
    this.showDeleteConfirm = false; // template *ngIf hides the modal
  }

  deleteFund() {
    this.fundsService.delete(this.index).subscribe({
      // After successful delete, navigate back to table — the record no longer exists
      // Staying on the edit page would be a broken state
      next: () => this.router.navigate(['/funds']),
    });
  }

  // Navigate back to the detail view for this fund
  goBack() {
    this.router.navigate(['/funds', this.index, 'detail']);
  }
}