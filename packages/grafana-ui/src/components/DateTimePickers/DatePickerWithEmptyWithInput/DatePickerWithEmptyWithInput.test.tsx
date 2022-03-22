import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DatePickerWithEmptyWithInput } from './DatePickerWithEmptyWithInput';

describe('DatePickerWithEmpty', () => {
  it('renders date input', () => {
    render(
      <DatePickerWithEmptyWithInput
        isDateInput={true}
        returnValue={'start'}
        onChange={jest.fn()}
        value={new Date(1400000000000)}
      />
    );
    expect(screen.getByDisplayValue('05/13/2014')).toBeInTheDocument();
  });
  it('render when isDateInput is false', async () => {
    render(<DatePickerWithEmptyWithInput isDateInput={false} returnValue={'start'} onChange={jest.fn()} />);
    const inputFields = await screen.findAllByPlaceholderText('Date');

    expect(inputFields[0]).toBeInTheDocument();
  });

  describe('input is clicked', () => {
    it('should click on the Input and should open the datepicker', async () => {
      render(<DatePickerWithEmptyWithInput isDateInput={false} returnValue={'start'} onChange={jest.fn()} />);
      const dateInputs = await screen.findAllByPlaceholderText('Date');
      fireEvent.click(dateInputs[0]);
      const datePickerDateInput = await screen.findByText('Date Input');
      expect(datePickerDateInput).toBeInTheDocument();
    });
    it('should check date input switch', async () => {
      render(<DatePickerWithEmptyWithInput isDateInput={false} returnValue={'start'} onChange={jest.fn()} />);
      const dateInputs = await screen.findAllByPlaceholderText('Date');
      fireEvent.click(dateInputs[0]);
      const datePickerDateInput = await screen.findByText('Date Input');
      expect(datePickerDateInput).toBeInTheDocument();

      let isDateSwitch = screen.getByRole('checkbox', { checked: false });
      expect(isDateSwitch).not.toBeChecked();
      expect(isDateSwitch).toBeInTheDocument();
    });
    it('should click on a date', async () => {
      const onChange = jest.fn();

      render(
        <DatePickerWithEmptyWithInput
          value={new Date(1370123999999)}
          isDateInput={true}
          returnValue={'start'}
          onChange={onChange}
        />
      );
      const dateInput = screen.getByDisplayValue('06/01/2013');
      expect(dateInput).toBeInTheDocument();
      fireEvent.click(dateInput);

      const endOfMoth = screen.getByText('31');
      endOfMoth.parentElement?.click();
      expect(screen.getAllByText('May 2013')[0]).toBeInTheDocument();
      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('closes calendar after outside wrapper is clicked', async () => {
      render(
        <DatePickerWithEmptyWithInput
          value={new Date(1370123999999)}
          isDateInput={true}
          returnValue={'start'}
          onChange={jest.fn()}
        />
      );
      const dateInputs = await screen.findAllByPlaceholderText('Date');
      fireEvent.click(dateInputs[0]);

      expect(dateInputs[0]).toBeInTheDocument();
      expect(screen.getAllByText('June 2013')[0]).toBeInTheDocument();
      const datePicker = await screen.findByTestId('date-picker');
      fireEvent.click(document);
      expect(datePicker).not.toBeInTheDocument();
    });
  });
});
