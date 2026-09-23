type TestCase<T> = {
  name: string;
  actual: T;
  expected: T;
};

type Employee = {
  id: number;
  name: string;
  department: 'QA' | 'DEV' | 'HR' | 'OPS';
  salary: number;
  active: boolean;
  yearsOfExperience?: number;
};

type EmployeeSummary = {
  label: string;
  monthlySalary: number;
};

const employees: Employee[] = [
  { id: 1, name: 'Alice', department: 'QA', salary: 10000, active: true, yearsOfExperience: 4 },
  { id: 2, name: 'Bob', department: 'DEV', salary: 15000, active: true, yearsOfExperience: 5 },
  { id: 3, name: 'Charlie', department: 'QA', salary: 12000, active: false, yearsOfExperience: 6 },
  { id: 4, name: 'David', department: 'DEV', salary: 18000, active: true, yearsOfExperience: 8 },
  { id: 5, name: 'Eve', department: 'QA', salary: 11000, active: true },
  { id: 6, name: 'Michael', department: 'HR', salary: 8000, active: true, yearsOfExperience: 2 },
  { id: 7, name: 'Natalia', department: 'OPS', salary: 9000, active: false, yearsOfExperience: 3 }
];

function assertEquals<T>({ name, actual, expected }: TestCase<T>) {
  if (actual !== expected) {
    throw new Error(`${name}: expected ${String(expected)}, got ${String(actual)}`);
  }

  console.log(`${name}: ok`);
}

function assertDeepEquals<T>({ name, actual, expected }: TestCase<T>) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${name}: expected ${expectedJson}, got ${actualJson}`);
  }

  console.log(`${name}: ok`);
}

function section(name: string) {
  console.log(`\n${name}`);
}

// 1. Find one employee
function findEmployeeByName(employeeList: Employee[], name: string): Employee | undefined {
  // find returns the first matching item.
  // If nothing matches, it returns undefined.
  return employeeList.find(employee => employee.name === name);
}

// 2. Filter active employees
function getActiveEmployees(employeeList: Employee[]): Employee[] {
  // filter keeps only items where the callback returns true.
  return employeeList.filter(employee => employee.active);
}

// 3. Find highest earner
function findHighestEarner(employeeList: Employee[]): Employee {
  if (employeeList.length === 0) {
    throw new Error('No employees provided');
  }

  let highestEarner = employeeList[0];

  for (const employee of employeeList) {
    if (employee.salary > highestEarner.salary) {
      highestEarner = employee;
    }
  }

  return highestEarner;
}

// 4. Create display summaries
function createEmployeeSummaries(employeeList: Employee[]): EmployeeSummary[] {
  // map transforms each item into another shape.
  return employeeList.map(employee => ({
    label: `${employee.name} (${employee.department})`,
    monthlySalary: employee.salary
  }));
}

// 5. Count employees by department with Map
function countEmployeesByDepartment(employeeList: Employee[]): Map<Employee['department'], number> {
  const counts = new Map<Employee['department'], number>();

  for (const employee of employeeList) {
    // Map.get can return undefined when the key does not exist yet.
    // ?? 0 means "start from 0 if this department has no count yet".
    const currentCount = counts.get(employee.department) ?? 0;
    counts.set(employee.department, currentCount + 1);
  }

  return counts;
}

// 6. Group employees by department with Map
function groupEmployeesByDepartment(employeeList: Employee[]): Map<Employee['department'], Employee[]> {
  const groups = new Map<Employee['department'], Employee[]>();

  for (const employee of employeeList) {
    // This version avoids the non-null assertion operator (!).
    // We read the current bucket or create a new empty bucket.
    const employeesInDepartment = groups.get(employee.department) ?? [];

    employeesInDepartment.push(employee);

    // Setting it back is important when the bucket was newly created.
    groups.set(employee.department, employeesInDepartment);
  }

  return groups;
}

// 7. Count employees by department with a plain object
function countEmployeesByDepartmentObject(employeeList: Employee[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const employee of employeeList) {
    counts[employee.department] = (counts[employee.department] ?? 0) + 1;
  }

  return counts;
}

// 8. Calculate total payroll
function calculateTotalPayroll(employeeList: Employee[]): number {
  // reduce is useful when we turn an array into one result.
  // Here the one result is one number: total salary.
  return employeeList.reduce((total, employee) => total + employee.salary, 0);
}

// 9. Calculate average salary by department
function calculateAverageSalaryByDepartment(employeeList: Employee[], department: Employee['department']): number {
  const employeesInDepartment = employeeList.filter(employee => employee.department === department);

  if (employeesInDepartment.length === 0) {
    return 0;
  }

  const totalSalary = calculateTotalPayroll(employeesInDepartment);
  return totalSalary / employeesInDepartment.length;
}

// 10. Give a raise without mutating original employees
function giveRaise(employeeList: Employee[], department: Employee['department'], percent: number): Employee[] {
  return employeeList.map(employee => {
    if (employee.department !== department) {
      return employee;
    }

    // {...employee} creates a new object with the same fields.
    // salary overrides the previous salary in that new object.
    return {
      ...employee,
      salary: Math.round(employee.salary * (1 + percent / 100))
    };
  });
}

// 11. Sort by salary without mutating original employees
function sortEmployeesBySalaryDesc(employeeList: Employee[]): Employee[] {
  // sort mutates arrays, so copy first with [...employeeList].
  return [...employeeList].sort((left, right) => right.salary - left.salary);
}

// 12. Partition employees into active and inactive
function partitionByActive(employeeList: Employee[]) {
  const result = {
    active: [] as Employee[],
    inactive: [] as Employee[]
  };

  for (const employee of employeeList) {
    if (employee.active) {
      result.active.push(employee);
    } else {
      result.inactive.push(employee);
    }
  }

  return result;
}

// 13. Handle optional yearsOfExperience
function getExperienceLabel(employee: Employee): string {
  // yearsOfExperience is optional, so it may be undefined.
  // ?? 0 means we treat missing experience as 0 years.
  const years = employee.yearsOfExperience ?? 0;
  return `${employee.name}: ${years} years`;
}

// 14. Check if every employee has valid salary
function everyEmployeeHasPositiveSalary(employeeList: Employee[]): boolean {
  // every returns true only if all items pass the condition.
  return employeeList.every(employee => employee.salary > 0);
}

// 15. Check if any employee is inactive
function hasInactiveEmployee(employeeList: Employee[]): boolean {
  // some returns true if at least one item passes the condition.
  return employeeList.some(employee => !employee.active);
}

export async function runEmployeeTypescriptExercises() {
  section('1. Find one employee');
  assertEquals({
    name: 'finds Bob by name',
    actual: findEmployeeByName(employees, 'Bob')?.id,
    expected: 2
  });

  section('2. Filter active employees');
  assertDeepEquals({
    name: 'keeps active employee names',
    actual: getActiveEmployees(employees).map(employee => employee.name),
    expected: ['Alice', 'Bob', 'David', 'Eve', 'Michael']
  });

  section('3. Find highest earner');
  assertEquals({
    name: 'finds David as highest earner',
    actual: findHighestEarner(employees).name,
    expected: 'David'
  });

  section('4. Create display summaries');
  assertDeepEquals({
    name: 'creates first two labels',
    actual: createEmployeeSummaries(employees).slice(0, 2),
    expected: [
      { label: 'Alice (QA)', monthlySalary: 10000 },
      { label: 'Bob (DEV)', monthlySalary: 15000 }
    ]
  });

  section('5. Count employees by department with Map');
  assertDeepEquals({
    name: 'counts departments from Map',
    actual: Object.fromEntries(countEmployeesByDepartment(employees)),
    expected: {
      QA: 3,
      DEV: 2,
      HR: 1,
      OPS: 1
    }
  });

  section('6. Group employees by department with Map');
  const grouped = groupEmployeesByDepartment(employees);
  assertDeepEquals({
    name: 'groups QA employees',
    actual: grouped.get('QA')?.map(employee => employee.name),
    expected: ['Alice', 'Charlie', 'Eve']
  });

  section('7. Count employees by department with object');
  assertDeepEquals({
    name: 'counts departments from object',
    actual: countEmployeesByDepartmentObject(employees),
    expected: {
      QA: 3,
      DEV: 2,
      HR: 1,
      OPS: 1
    }
  });

  section('8. Calculate total payroll');
  assertEquals({
    name: 'sums all salaries',
    actual: calculateTotalPayroll(employees),
    expected: 83000
  });

  section('9. Calculate average salary by department');
  assertEquals({
    name: 'calculates DEV average salary',
    actual: calculateAverageSalaryByDepartment(employees, 'DEV'),
    expected: 16500
  });

  section('10. Give a raise without mutation');
  const employeesAfterQaRaise = giveRaise(employees, 'QA', 10);
  assertEquals({
    name: 'raises Alice salary in returned list',
    actual: employeesAfterQaRaise.find(employee => employee.name === 'Alice')?.salary,
    expected: 11000
  });
  assertEquals({
    name: 'keeps original Alice salary unchanged',
    actual: employees.find(employee => employee.name === 'Alice')?.salary,
    expected: 10000
  });

  section('11. Sort by salary');
  assertDeepEquals({
    name: 'sorts salaries descending',
    actual: sortEmployeesBySalaryDesc(employees).map(employee => employee.name),
    expected: ['David', 'Bob', 'Charlie', 'Eve', 'Alice', 'Natalia', 'Michael']
  });

  section('12. Partition active and inactive');
  const partitioned = partitionByActive(employees);
  assertDeepEquals({
    name: 'finds inactive employees',
    actual: partitioned.inactive.map(employee => employee.name),
    expected: ['Charlie', 'Natalia']
  });

  section('13. Handle optional experience');
  assertEquals({
    name: 'uses zero for missing experience',
    actual: getExperienceLabel(employees[4]),
    expected: 'Eve: 0 years'
  });

  section('14. Every employee salary is positive');
  assertEquals({
    name: 'all salaries are positive',
    actual: everyEmployeeHasPositiveSalary(employees),
    expected: true
  });

  section('15. Any inactive employee exists');
  assertEquals({
    name: 'inactive employee exists',
    actual: hasInactiveEmployee(employees),
    expected: true
  });

  console.log('\nEmployee TypeScript exercises passed.');
}

if (require.main === module) {
  runEmployeeTypescriptExercises().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
