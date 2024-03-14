import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Cart, CartItem } from '../models/cart.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // BehaviorSubject pour suivre les changements du panier
  cart = new BehaviorSubject<Cart>({items: []});
  // Clé pour le stockage local
  private readonly STORAGE_KEY = 'cart';

  constructor(private _snackBar: MatSnackBar) {
    // Charge le panier depuis le localStorage lors de l'initialisation du service
    const storedCart = localStorage.getItem(this.STORAGE_KEY);
    if (storedCart) {
      this.cart.next(JSON.parse(storedCart));
    }
  }

  // Met à jour le panier et le stocke dans le localStorage
  private updateCart(cart: Cart): void {
    this.cart.next(cart);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  // Ajoute un article au panier
  addToCart(item: CartItem): void {
    const items = [...this.cart.value.items];

    const itemInCart = items.find((_item) => _item.id === item.id);

    if(itemInCart) {
      itemInCart.quantity += 1;
    } else {
      items.push(item);
    }

    this.updateCart({ items });
    this._snackBar.open('Article ajouté dans le panier.', 'OK', { duration: 3000 });
  }

  removeQuantity(item: CartItem): void {
    let itemForRemoval: CartItem | undefined;
  
    const updatedItems = this.cart.value.items.map((_item) => {
      if (_item.id === item.id) {
        // Vérifier si la quantité est déjà de 0 pour éviter les valeurs négatives
        if (_item.quantity > 0) {
          _item.quantity--;
          // Si la quantité atteint 0, définissez l'élément à supprimer
          if (_item.quantity === 0) {
            itemForRemoval = _item;
          }
        }
      }
  
      return _item;
    });
  
    // Si un article doit être complètement supprimé, appel removeFromCart avec update = false
    if (itemForRemoval) {
      this.removeFromCart(itemForRemoval, false);
    } else if (item.quantity === 0) {
      // Afficher un message lorsque la quantité est déjà de 0
      this._snackBar.open('La quantité ne peut etre négative.', 'OK', {
        duration: 3000
      });
    } else {
      // Mettre à jour le panier avec les articles mis à jour
      this.cart.next({ items: updatedItems });
  
      // Mettre à jour le localStorage avec les articles mis à jour
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ items: updatedItems }));
  
      // Afficher le message de suppression standard
      this._snackBar.open('1 Article supprimé du panier.', 'OK', {
        duration: 3000
      });
    }
  }
  

  // Calcule le total du panier
  getTotal(items: Array<CartItem>): number {
    return items
      .map((item) => item.price * item.quantity)
      .reduce((prev, current) => prev + current, 0);
  }

  // Vide le panier
  clearCart(): void {
    this.updateCart({ items: [] });
    this._snackBar.open('Le Panier est vidé.', 'OK', {
      duration: 3000
    });
  }

  removeFromCart(item: CartItem, update = true): Array<CartItem> {
    // Filtrer les articles pour supprimer celui avec l'ID donné
    const filteredItems = this.cart.value.items.filter(
      (_item) => _item.id !== item.id
    );

    if(update) {
      // Mettre à jour le panier avec les articles filtrés
      this.cart.next( { items: filteredItems });
    
      // Mettre à jour le localStorage avec les articles filtrés
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ items: filteredItems }));
    
      // Afficher le message de suppression
      this._snackBar.open('Article(s) supprimé du panier.', 'OK', {
        duration: 3000
      });
    }

    return filteredItems;
  
  }

}
