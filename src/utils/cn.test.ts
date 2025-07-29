import { cn } from './cn';

describe('cn utility', () => {
  it('should combine multiple class names', () => {
    const result = cn('class1', 'class2', 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle conditional classes', () => {
    const condition = true;
    const result = cn('base', condition && 'conditional');
    expect(result).toBe('base conditional');
  });

  it('should exclude falsy values', () => {
    const result = cn('base', false && 'excluded', null, undefined, '', 'included');
    expect(result).toBe('base included');
  });

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should handle conflicting classes
    const result = cn('bg-red-500', 'bg-blue-500');
    expect(result).toBe('bg-blue-500'); // Later class should win
  });

  it('should handle array inputs', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should handle object inputs', () => {
    const result = cn({
      'included': true,
      'excluded': false,
      'also-included': true,
    });
    expect(result).toBe('included also-included');
  });

  it('should handle mixed input types', () => {
    const result = cn(
      'string-class',
      ['array', 'classes'],
      {
        'object-true': true,
        'object-false': false,
      },
      true && 'conditional',
      false && 'excluded'
    );
    expect(result).toBe('string-class array classes object-true conditional');
  });

  it('should return empty string for no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should return empty string for all falsy arguments', () => {
    const result = cn(false, null, undefined, '', 0);
    expect(result).toBe('');
  });

  it('should handle tailwind modifier classes', () => {
    const result = cn('hover:bg-blue-500', 'focus:ring-2', 'dark:text-white');
    expect(result).toBe('hover:bg-blue-500 focus:ring-2 dark:text-white');
  });

  it('should merge spacing classes correctly', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8'); // Later padding should win
  });

  it('should merge complex tailwind utilities', () => {
    const result = cn('mt-4 mb-4', 'my-8');
    expect(result).toBe('my-8'); // my-8 should replace mt-4 mb-4
  });

  it('should preserve non-conflicting classes', () => {
    const result = cn('bg-blue-500 text-white', 'p-4 rounded');
    expect(result).toBe('bg-blue-500 text-white p-4 rounded');
  });

  it('should handle responsive breakpoint classes', () => {
    const result = cn('md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4');
    expect(result).toBe('md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
  });

  it('should merge same breakpoint classes', () => {
    const result = cn('md:p-4', 'md:p-8');
    expect(result).toBe('md:p-8'); // Later should win for same breakpoint
  });

  it('should handle arbitrary value classes', () => {
    const result = cn('w-[100px]', 'h-[200px]', 'top-[50%]');
    expect(result).toBe('w-[100px] h-[200px] top-[50%]');
  });

  it('should merge arbitrary value classes correctly', () => {
    const result = cn('w-[100px]', 'w-[200px]');
    expect(result).toBe('w-[200px]'); // Later should win
  });
});