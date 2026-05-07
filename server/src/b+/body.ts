import { Order } from "../types/interfaces/interfaces.common"; // The interface we defined earlier



class BPlusNode {
  public keys: number[] = [];
  public data: Order[][] = []; 
  public children: BPlusNode[] = [];
  public leaf: boolean;
  public next: BPlusNode | null = null;

  constructor(leaf: boolean = false) {
    this.leaf = leaf;
  }
}

export class BPlusTree {
  private root: BPlusNode;
  private t: number;

  constructor(t: number = 3) {
    this.root = new BPlusNode(true);
    this.t = t;
  }


  public getBestPrice(type: 'MIN' | 'MAX'): number | null {
    if (this.root.keys.length === 0) return null;
    
    let curr = this.root;
    if (type === 'MIN') {
      while (!curr.leaf) curr = curr.children[0];
      return curr.keys[0];
    } else {
      while (!curr.leaf) curr = curr.children[curr.children.length - 1];
      return curr.keys[curr.keys.length - 1];
    }
  }


  public getOrdersAtPrice(price: number): Order[] {
    const leaf = this.findLeaf(price);
    if (!leaf) return [];
    const index = leaf.keys.indexOf(price);
    return index !== -1 ? leaf.data[index] : [];
  }

 
  public delete(price: number): void {
    const leaf = this.findLeaf(price);
    if (!leaf) return;
    
    const index = leaf.keys.indexOf(price);
    if (index !== -1) {
      leaf.keys.splice(index, 1);
      leaf.data.splice(index, 1);
    }

  }


  private findLeaf(price: number): BPlusNode | null {
    let curr = this.root;
    while (!curr.leaf) {
      let i = 0;
      while (i < curr.keys.length && price >= curr.keys[i]) i++;
      curr = curr.children[i];
    }
    return curr;
  }

  // --- Insertion Logic ---
  public insert(price: number, order: Order): void {
    const root = this.root;
    if (root.keys.length === 2 * this.t - 1) {
      const s = new BPlusNode(false);
      s.children[0] = root;
      this.splitChild(s, 0, root);
      this.root = s;
    }
    this.insertNonFull(this.root, price, order);
  }

  private insertNonFull(node: BPlusNode, price: number, order: Order) {
    let i = node.keys.length - 1;

    if (node.leaf) {
      const idx = node.keys.indexOf(price);
      if (idx !== -1) {
        node.data[idx].push(order); // Maintain Time Priority (FIFO)
        return;
      }

      while (i >= 0 && node.keys[i] > price) {
        node.keys[i + 1] = node.keys[i];
        node.data[i + 1] = node.data[i];
        i--;
      }
      node.keys[i + 1] = price;
      node.data[i + 1] = [order];
    } else {
      while (i >= 0 && node.keys[i] > price) i--;
      i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this.splitChild(node, i, node.children[i]);
        if (node.keys[i] < price) i++;
      }
      this.insertNonFull(node.children[i], price, order);
    }
  }

  private splitChild(parent: BPlusNode, i: number, child: BPlusNode) {
    const newNode = new BPlusNode(child.leaf);
    newNode.keys = child.keys.splice(this.t);
    
    if (child.leaf) {
      newNode.data = child.data.splice(this.t);
      newNode.next = child.next;
      child.next = newNode;
    } else {
      newNode.children = child.children.splice(this.t);
    }

    parent.keys.splice(i, 0, child.keys.pop()!);
    parent.children.splice(i + 1, 0, newNode);
  }


public getAggregatedLevels(limit: number): { price: number; size: number; total: number }[] {
  let levels: { price: number; size: number; total: number }[] = [];
  let curr: any = this.root;

  // 1. Traverse to the leftmost leaf (lowest price)
  while (curr && !curr.leaf) {
    curr = curr.children[0];
  }

  let cumulativeTotal = 0;

  // 2. Traverse horizontally across leaves using the 'next' pointer
  while (curr && levels.length < limit) {
    for (let i = 0; i < curr.keys.length; i++) {
      if (levels.length >= limit) break;

      const price = curr.keys[i];
      // Sum up all quantities in the FIFO queue at this price level
      const size = curr.data[i].reduce((acc: number, order: any) => acc + order.quantity, 0);
      
      cumulativeTotal += size;

      levels.push({
        price,
        size,
        total: cumulativeTotal
      });
    }
    curr = curr.next;
  }

  return levels;
}
}