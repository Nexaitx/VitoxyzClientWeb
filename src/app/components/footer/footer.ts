import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {

  year = new Date().getFullYear();

  constructor(private router: Router) {}

  /* =========================
     FOOTER LINK SCROLL
  ========================== */

  @HostListener('click', ['$event'])
  onFooterClick(event: MouseEvent): void {

    const target = event.target as HTMLElement;
    const link = target.closest('a');

    if (!link) {
      return;
    }

    if (!link.closest('.site-footer')) {
      return;
    }

    // Don't interfere with external/social links
    if (
      link.hasAttribute('target') ||
      link.getAttribute('href')?.startsWith('http') ||
      link.getAttribute('href')?.startsWith('mailto:') ||
      link.getAttribute('href')?.startsWith('tel:')
    ) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  navigateToSkinCare(event: MouseEvent): void {
  event.preventDefault();
  event.stopPropagation();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });

  this.router.navigate(['/products'], {
    queryParams: {
      category: 'Skin Care',
      forms: [
        'Face Wash',
        'Moisturizer',
        'Sunscreen',
        'Serum',
        'Cream',
        'Lotion',
        'Shampoo',
        'Hair Care'
      ].join(',')
    }
  });
  }

  navigateToElderCare(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    this.router.navigate(['/products'], {
      queryParams: {
        category: 'Elder Care',
        forms: [].join(',')
      }
    });
  }

  goToPlayStore(): void {
    window.open(
      'https://play.google.com/store/apps/',
      '_blank'
    );
  }

  goToAppStore(): void {
    window.open(
      'https://apps.apple.com/app/id1234567890',
      '_blank'
    );
  }
}