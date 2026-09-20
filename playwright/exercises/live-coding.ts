type ExerciseResult<T> = {
  name: string;
  actual: T;
  expected: T;
};

type Employee = {
  name: string;
  age: number;
  department: string;
  salary: number;
  active: boolean;
}

class ClassEmployee {

}

const employees: Employee[] = [
  { name: 'Alice', age: 30, department: 'QA', salary: 10000, active: true },
  { name: 'Bob', age: 25, department: 'DEV', salary: 15000, active: true },
  { name: 'Charlie', age: 35, department: 'QA', salary: 12000, active: false },
  { name: 'David', age: 28, department: 'DEV', salary: 18000, active: true },
  { name: 'Eve', age: 32, department: 'QA', salary: 11000, active: true },
  { name: 'Michael', age: 27, department: 'HR', salary: 8000, active: true }
]



function assertEquals<T>({ name, actual, expected }: ExerciseResult<T>) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${String(expected)}, got ${String(actual)}`);
  }

  console.log(`${name}: ok`);
}

function reverseWords(value: string) {
  return value
    .split(' ')
    .reverse()
    .join(' ');
}

assertEquals({
  name: 'reverseWords keeps words intact and reverses their order',
  actual: reverseWords('skates wheels bearings'),
  expected: 'bearings wheels skates'
});

console.log('Live coding exercise finished.');
