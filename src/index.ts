/**
 * Entry point file
 *
 * You can use this file to manually test your implementation.
 */
import { find_differences } from './find_differences';
import { merge_trees } from './merge_trees';

const beforeEdit = {
  tag: 'div',
  attributes: { class: 'container' },
  children: [{ tag: 'p', children: [{ text: 'Hello World' }] }]
};

const afterEdit = {
  tag: 'div',
  attributes: { class: 'container updated' },
  children: [{ tag: 'h1', children: [{ text: 'Welcome!' }] }]
};

console.log('Diff result:');
console.log(find_differences(beforeEdit, afterEdit));

console.log('Merged result:');
console.log(merge_trees(beforeEdit, afterEdit));
