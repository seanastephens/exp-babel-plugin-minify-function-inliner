# Example

Input:
```javascript
function f() {
  return 42;
}

console.log(f());
```

Output:
```javascript
let _temp;

_temp2: {
  _temp = 42;
  break _temp2;
}

console.log(_temp);
```

# To run:

```bash
npm install
node_modules/.bin/babel --plugins=. < input.js
```
