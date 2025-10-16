import { Component } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CartService, CartItem } from './cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [],
  template: ``, // tu template aquí
  styles: []
})
export class CartComponent {
  items: CartItem[] = [];
  totalPrice: number = 0;
  totalItems: number = 0;

  constructor(private cartService: CartService) {
    // ✅ Se desuscribe automáticamente cuando el componente se destruye
    this.cartService.items$
      .pipe(takeUntilDestroyed())
      .subscribe(items => {
        this.items = items;
        this.calculateTotals();
      });
  }

  // ⚠️ NO necesitas ngOnDestroy

  private calculateTotals(): void {
    this.totalPrice = this.items.reduce((total, item) =>
      total + (item.price * item.quantity), 0
    );
    this.totalItems = this.items.reduce((total, item) =>
      total + item.quantity, 0
    );
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.id, item.quantity - 1);
    } else {
      this.removeItem(item.id);
    }
  }

  removeItem(itemId: number): void {
    this.cartService.removeItem(itemId);
  }

  clearCart(): void {
    this.cartService.clearCart();
  }
}
