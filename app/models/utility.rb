class Utility

  def self.formatted_sentence(string)

    conflicted = "'"
    unconflicted = "'"

    if string
      return string.tr(conflicted, unconflicted)
    end

    return "No"
  
  end

  def self.formatted_year(string) # yyyy-xx-xx

    if string
      return string.split('-').first.to_i # yyyy
    end

    return 0

  end

end