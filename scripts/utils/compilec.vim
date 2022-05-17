function! CompileC()
    if matchstr(:f, '\.cpp')
        g++ :f
    else
        gcc :f
    endif
    ./a.out
endfunction

nmap <silent>   ;c  :call CompileC()<CR>