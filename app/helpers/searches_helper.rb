module SearchesHelper
  # set a variable reversed to 0 and number to a variable called num to pass into while loop
  # @param [Object] x
  def palindrome?(x)
    if x.negative?
      false
      # the number to reverse does not equal 0 (completely extracted)
      # continue extracting the ones value and adding it to the reversed number
      # multiplied by 10 (to move it into the tens value)
      # if it’s not in the ones value, since the reversed originally is set to 0,
      # it would place that extracted number in the ones value. thus reversing the integer.
    else
      reversed = 0
      num = x
      while num != x
        extracted = num % 10
        # set variable num to num divided by 10, thus getting rid of the ones value since when you just use
        # the division operator in ruby, it does not return the remainder.
        reversed = (reversed * 10) + extracted
        num /= 10
      end
      # Once num value hits 0, the while loop extracted everything and the integer is reversed.
      # check the condition.If my reversed integer, does not equal my original integer, the original integer is NOT a palindrome.
      reversed == x
    end

  end
end
